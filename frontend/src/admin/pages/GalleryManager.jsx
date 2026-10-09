import { useState, useMemo, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Images,
  Plus,
  Search,
  Filter,
  Star,
  Eye,
  EyeOff,
  Trash2,
  Edit3,
  X,
  UploadCloud,
  Check,
  Sparkles,
  SlidersHorizontal,
  Camera,
  ArrowUpDown,
  MoveLeft,
  MoveRight,
  AlertCircle,
  RefreshCw,
  FolderPlus,
  FolderHeart,
  ImageIcon,
  RotateCcw,
} from "lucide-react";
import ConfirmModal from "../components/ConfirmModal";
import EmptyState from "../components/EmptyState";
import Pagination from "../components/Pagination";
import { AddCategoryModal, ManageCategoriesModal } from "../components/CategoryModals";
import { useAdminData } from "../context/AdminDataContext";
import { useToast } from "../context/ToastContext";
import api from "../../lib/api";
import { uploadFilesWithConcurrency, DEFAULT_MAX_CONCURRENT_UPLOADS } from "../../lib/uploadQueue";

export default function GalleryManager() {
  const [searchParams] = useSearchParams();
  const isNewParam = searchParams.get("new") === "true";

  const {
    albums,
    addAlbum,
    updateAlbum,
    deleteAlbum,
    toggleAlbumPublished,
    addPhotosToAlbum,
    updateAlbumPhoto,
    removePhotoFromAlbum,
    reorderAlbumPhotos,
    setAlbumCover,
    getAlbumDetail,
    getMediaLibrary,
    refetchAlbums,
    galleryCategories,
    addGalleryCategory,
    toggleGalleryCategoryStatus,
  } = useAdminData();

  const { addToast } = useToast();

  // Search & Filters
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // "all" | "published" | "draft"
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  // Modals
  const [albumModalOpen, setAlbumModalOpen] = useState(false);
  const [editingAlbum, setEditingAlbum] = useState(null);
  const [managePhotosModalOpen, setManagePhotosModalOpen] = useState(false);
  const [activeAlbumForPhotos, setActiveAlbumForPhotos] = useState(null);
  const [mediaLibraryModalOpen, setMediaLibraryModalOpen] = useState(false);
  const [mediaPickerMode, setMediaPickerMode] = useState("cover"); // "cover" | "photos"
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [albumToDelete, setAlbumToDelete] = useState(null);
  const [addCategoryModalOpen, setAddCategoryModalOpen] = useState(false);
  const [manageCategoriesModalOpen, setManageCategoriesModalOpen] = useState(false);

  // Active Category Names
  const activeCategoryNames = useMemo(() => {
    if (galleryCategories && galleryCategories.length > 0) {
      return galleryCategories.filter((c) => c.active !== false).map((c) => c.name);
    }
    return [
      "Wedding",
      "Reception",
      "Engagement",
      "Couple Shoot",
      "Baby Shoot",
      "Maternity Shoot",
      "Birthday",
      "Puberty Ceremony",
      "House Warming",
      "Corporate",
    ];
  }, [galleryCategories]);

  // Form State for Add / Edit Album
  const initialFormState = {
    title: "",
    category: "",
    coverImage: "",
    description: "",
    published: true,
    initialPhotos: [], // [{ url, caption, aspect }]
  };
  const [formData, setFormData] = useState(initialFormState);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Multi-upload queue for Manage Photos & Add Album
  const [uploadQueue, setUploadQueue] = useState([]); // [{ id, file, name, preview, progress, status, error, resultUrl }]
  const fileInputRef = useRef(null);
  const addModalPhotosRef = useRef(null);

  // Staged Album Photos state for Add & Edit Album Modal
  const [modalPhotos, setModalPhotos] = useState([]); // [{ id, url, caption, aspect, order, isOriginal, isNew, isReplaced, isMarkedForRemoval, file, uploadProgress, uploadStatus, uploadError }]
  const [editPhotosLoading, setEditPhotosLoading] = useState(false);
  const [editPhotosError, setEditPhotosError] = useState(null);
  const [replacingPhotoId, setReplacingPhotoId] = useState(null);
  const [previewPhotoUrl, setPreviewPhotoUrl] = useState(null);
  const photosFileInputRef = useRef(null);
  const replaceFileInputRef = useRef(null);

  // Derived counts for modal photos
  const activePhotosCount = useMemo(() => {
    return modalPhotos.filter((p) => !p.isMarkedForRemoval).length;
  }, [modalPhotos]);

  const pendingRemovalCount = useMemo(() => {
    return modalPhotos.filter((p) => p.isMarkedForRemoval).length;
  }, [modalPhotos]);

  const pendingReplacedCount = useMemo(() => {
    return modalPhotos.filter((p) => p.isReplaced && !p.isMarkedForRemoval).length;
  }, [modalPhotos]);

  const pendingUploadingCount = useMemo(() => {
    return modalPhotos.filter(
      (p) => ["queued", "uploading", "optimizing"].includes(p.uploadStatus) && !p.isMarkedForRemoval
    ).length;
  }, [modalPhotos]);

  const failedUploadsCount = useMemo(() => {
    return modalPhotos.filter((p) => p.uploadStatus === "failed" && !p.isMarkedForRemoval).length;
  }, [modalPhotos]);

  const isAnyPhotoUploading = pendingUploadingCount > 0;

  // Cover Image device upload state
  const coverFileInputRef = useRef(null);
  const [coverUploading, setCoverUploading] = useState(false);
  const [coverProgress, setCoverProgress] = useState(0);
  const [coverUploadError, setCoverUploadError] = useState(null);
  const [coverTempPreview, setCoverTempPreview] = useState(null);

  // Lock background scroll & handle Escape key when modals are open
  useEffect(() => {
    if (albumModalOpen || managePhotosModalOpen || mediaLibraryModalOpen || previewPhotoUrl) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      const handleKeyDown = (e) => {
        if (e.key === "Escape") {
          if (previewPhotoUrl) {
            setPreviewPhotoUrl(null);
          } else if (mediaLibraryModalOpen) {
            setMediaLibraryModalOpen(false);
          } else if (managePhotosModalOpen) {
            setManagePhotosModalOpen(false);
          } else if (albumModalOpen) {
            handleCloseAlbumModal();
          }
        }
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        document.body.style.overflow = prevOverflow;
        window.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [albumModalOpen, managePhotosModalOpen, mediaLibraryModalOpen, previewPhotoUrl]);

  // Media Library state
  const [mediaLibraryItems, setMediaLibraryItems] = useState([]);
  const [loadingMediaLibrary, setLoadingMediaLibrary] = useState(false);
  const [selectedMediaUrls, setSelectedMediaUrls] = useState([]);

  // Auto-open modal if ?new=true
  useEffect(() => {
    if (isNewParam && !albumModalOpen) {
      handleOpenCreate();
    }
  }, [isNewParam]);

  // Load Media Library when picker opens
  const openMediaPicker = async (mode = "cover") => {
    setMediaPickerMode(mode);
    setSelectedMediaUrls([]);
    setMediaLibraryModalOpen(true);
    setLoadingMediaLibrary(true);
    try {
      const items = await getMediaLibrary();
      setMediaLibraryItems(Array.isArray(items) ? items : []);
    } catch (err) {
      addToast({ type: "error", message: "Failed to load media library items." });
    } finally {
      setLoadingMediaLibrary(false);
    }
  };

  const handleSelectMediaItem = (url) => {
    if (mediaPickerMode === "cover") {
      setFormData((prev) => ({ ...prev, coverImage: url }));
      setMediaLibraryModalOpen(false);
      addToast({ type: "success", message: "Cover image selected from media library." });
    } else {
      // Toggle in multi-select for photos
      setSelectedMediaUrls((prev) =>
        prev.includes(url) ? prev.filter((u) => u !== url) : [...prev, url]
      );
    }
  };

  const handleConfirmMediaPhotos = async () => {
    if (selectedMediaUrls.length === 0) {
      setMediaLibraryModalOpen(false);
      return;
    }

    if (activeAlbumForPhotos) {
      // Adding directly to existing album
      try {
        const photoObjects = selectedMediaUrls.map((url) => ({
          url,
          aspect: "portrait",
        }));
        await addPhotosToAlbum(activeAlbumForPhotos.id, photoObjects);
        const refreshed = await getAlbumDetail(activeAlbumForPhotos.id);
        setActiveAlbumForPhotos(refreshed);
        addToast({
          type: "success",
          message: `Added ${selectedMediaUrls.length} photos to album.`,
        });
      } catch (err) {
        addToast({ type: "error", message: err.message || "Failed to add photos." });
      }
    } else {
      // Adding to Add / Edit Album modal
      const newItems = selectedMediaUrls.map((url) => ({
        id: `media-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        url,
        caption: "",
        aspect: "portrait",
        isOriginal: false,
        isNew: true,
        isReplaced: false,
        isMarkedForRemoval: false,
        uploadStatus: "complete",
        uploadProgress: 100,
        uploadError: null,
      }));
      setModalPhotos((prev) => [...prev, ...newItems]);
      if (formErrors.photos) {
        setFormErrors((prev) => ({ ...prev, photos: null }));
      }
      addToast({
        type: "success",
        message: `Selected ${selectedMediaUrls.length} photos for this album.`,
      });
    }

    setMediaLibraryModalOpen(false);
    setSelectedMediaUrls([]);
  };

  // Filtered albums
  const filteredAlbums = useMemo(() => {
    return (albums || []).filter((album) => {
      const matchesCat =
        selectedCategory === "All" ||
        (album.category || "").toLowerCase() === selectedCategory.toLowerCase();

      const matchesSearch =
        searchQuery === "" ||
        (album.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (album.category || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (album.description || "").toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "published" && album.published) ||
        (statusFilter === "draft" && !album.published);

      return matchesCat && matchesSearch && matchesStatus;
    });
  }, [albums, selectedCategory, searchQuery, statusFilter]);

  const paginatedAlbums = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAlbums.slice(start, start + pageSize);
  }, [filteredAlbums, currentPage, pageSize]);

  // Open Add Album Modal
  const handleOpenCreate = () => {
    setEditingAlbum(null);
    setFormData({
      ...initialFormState,
      category: activeCategoryNames[0] || "Wedding",
    });
    setFormErrors({});
    setUploadQueue([]);
    setCoverUploadError(null);
    setCoverUploading(false);
    setCoverProgress(0);
    setCoverTempPreview(null);
    setModalPhotos([]);
    setEditPhotosLoading(false);
    setEditPhotosError(null);
    setReplacingPhotoId(null);
    if (coverFileInputRef.current) {
      coverFileInputRef.current.value = "";
    }
    if (photosFileInputRef.current) {
      photosFileInputRef.current.value = "";
    }
    setAlbumModalOpen(true);
  };

  // Open Edit Album Modal
  const handleOpenEdit = async (album) => {
    setEditingAlbum(album);
    setFormData({
      title: album.title || "",
      category: album.category || activeCategoryNames[0] || "Wedding",
      coverImage: album.coverImage || "",
      description: album.description || "",
      published: Boolean(album.published),
      initialPhotos: [],
    });
    setFormErrors({});
    setCoverUploadError(null);
    setCoverUploading(false);
    setCoverProgress(0);
    setCoverTempPreview(null);
    setModalPhotos([]);
    setEditPhotosLoading(true);
    setEditPhotosError(null);
    setReplacingPhotoId(null);
    if (coverFileInputRef.current) {
      coverFileInputRef.current.value = "";
    }
    if (photosFileInputRef.current) {
      photosFileInputRef.current.value = "";
    }
    setAlbumModalOpen(true);

    try {
      const fullAlbum = await getAlbumDetail(album.slug || album.id);
      const photos = fullAlbum?.photos || [];
      setModalPhotos(
        photos.map((p, idx) => ({
          id: p.id,
          url: p.url,
          caption: p.caption || "",
          aspect: p.aspect || "portrait",
          order: typeof p.order === "number" ? p.order : idx,
          isOriginal: true,
          isNew: false,
          isReplaced: false,
          isMarkedForRemoval: false,
          uploadStatus: "complete",
          uploadProgress: 100,
          uploadError: null,
        }))
      );
    } catch (err) {
      console.error("Failed to load album photos:", err);
      setEditPhotosError(err.message || "Failed to load album photos.");
      addToast({ type: "error", message: "Failed to load album photos." });
    } finally {
      setEditPhotosLoading(false);
    }
  };

  // Retry fetching album photos if initial load failed
  const handleRetryFetchAlbumPhotos = async () => {
    if (!editingAlbum) return;
    setEditPhotosLoading(true);
    setEditPhotosError(null);
    try {
      const fullAlbum = await getAlbumDetail(editingAlbum.slug || editingAlbum.id);
      const photos = fullAlbum?.photos || [];
      setModalPhotos(
        photos.map((p, idx) => ({
          id: p.id,
          url: p.url,
          caption: p.caption || "",
          aspect: p.aspect || "portrait",
          order: typeof p.order === "number" ? p.order : idx,
          isOriginal: true,
          isNew: false,
          isReplaced: false,
          isMarkedForRemoval: false,
          uploadStatus: "complete",
          uploadProgress: 100,
          uploadError: null,
        }))
      );
    } catch (err) {
      setEditPhotosError(err.message || "Failed to load album photos.");
    } finally {
      setEditPhotosLoading(false);
    }
  };

  // Close Add/Edit Album modal and discard unsaved edits
  const handleCloseAlbumModal = () => {
    setAlbumModalOpen(false);
    setEditingAlbum(null);
    setModalPhotos([]);
    setEditPhotosLoading(false);
    setEditPhotosError(null);
    setFormErrors({});
    setCoverUploadError(null);
    setCoverTempPreview(null);
    setReplacingPhotoId(null);
    if (coverFileInputRef.current) coverFileInputRef.current.value = "";
    if (photosFileInputRef.current) photosFileInputRef.current.value = "";
    if (replaceFileInputRef.current) replaceFileInputRef.current.value = "";
  };

  // Upload single photo file to server
  const uploadPhotoFile = async (file, onProgress) => {
    const formDataObj = new FormData();
    formDataObj.append("file", file);
    formDataObj.append("category", "gallery/albums");

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", "/api/uploads");

      const token = localStorage.getItem("subash_admin_token");
      if (token) {
        xhr.setRequestHeader("Authorization", `Bearer ${token}`);
      }

      xhr.upload.onprogress = (evt) => {
        if (evt.lengthComputable && onProgress) {
          const percent = Math.round((evt.loaded / evt.total) * 100);
          const stage = percent >= 100 ? "optimizing" : "uploading";
          onProgress(percent, stage);
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data = JSON.parse(xhr.responseText);
            if (data.url) {
              resolve(data.url);
            } else {
              reject(new Error("Upload succeeded but no image URL was returned."));
            }
          } catch {
            reject(new Error("Invalid response format from upload server."));
          }
        } else {
          let errMsg = `Upload failed (${xhr.status})`;
          try {
            const parsed = JSON.parse(xhr.responseText);
            if (parsed.error) errMsg = parsed.error;
          } catch {}
          reject(new Error(errMsg));
        }
      };

      xhr.onerror = () => {
        reject(new Error("Network error during photo upload."));
      };

      xhr.send(formDataObj);
    });
  };

  // Add photos from native device file picker (controlled concurrent queue)
  const handleAddModalPhotosSelect = async (e) => {
    const files = Array.from(e.target.files || []);
    if (photosFileInputRef.current) {
      photosFileInputRef.current.value = "";
    }
    if (files.length === 0) return;

    const validMimes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
      "image/avif",
    ];
    const maxBytes = 25 * 1024 * 1024;

    const validFiles = [];
    for (const file of files) {
      const isImage = validMimes.includes(file.type) || file.type.startsWith("image/");
      if (!isImage) {
        addToast({ type: "error", message: `Skipped "${file.name}": Unsupported format.` });
        continue;
      }
      if (file.size > maxBytes) {
        addToast({ type: "error", message: `Skipped "${file.name}": Exceeds 25MB limit.` });
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    // Staged items preserve user's selection order and enter in "queued" status
    const newStaged = validFiles.map((file) => {
      const tempUrl = URL.createObjectURL(file);
      return {
        id: `new-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        url: tempUrl,
        tempBlobUrl: tempUrl,
        caption: "",
        aspect: "portrait",
        isOriginal: false,
        isNew: true,
        isReplaced: false,
        isMarkedForRemoval: false,
        uploadStatus: "queued",
        uploadProgress: 0,
        uploadError: null,
        file,
      };
    });

    setModalPhotos((prev) => [...prev, ...newStaged]);
    if (formErrors.photos) {
      setFormErrors((prev) => ({ ...prev, photos: null }));
    }

    // Controlled concurrent upload queue (pool of DEFAULT_MAX_CONCURRENT_UPLOADS = 3)
    await uploadFilesWithConcurrency(
      newStaged,
      async (item) => {
        const permanentUrl = await uploadPhotoFile(item.file, (percent, stage) => {
          setModalPhotos((prev) =>
            prev.map((p) =>
              p.id === item.id
                ? { ...p, uploadProgress: percent, uploadStatus: stage }
                : p
            )
          );
        });

        setModalPhotos((prev) =>
          prev.map((p) =>
            p.id === item.id
              ? {
                  ...p,
                  url: permanentUrl,
                  uploadStatus: "complete",
                  uploadProgress: 100,
                  uploadError: null,
                }
              : p
          )
        );
        return permanentUrl;
      },
      {
        concurrency: DEFAULT_MAX_CONCURRENT_UPLOADS,
        onStart: (item) => {
          setModalPhotos((prev) =>
            prev.map((p) =>
              p.id === item.id && p.uploadStatus === "queued"
                ? { ...p, uploadStatus: "uploading", uploadProgress: 0, uploadError: null }
                : p
            )
          );
        },
        onComplete: (result, item) => {
          if (result.status === "rejected") {
            const errMsg = result.reason?.message || "Upload failed";
            setModalPhotos((prev) =>
              prev.map((p) =>
                p.id === item.id
                  ? { ...p, uploadStatus: "failed", uploadError: errMsg }
                  : p
              )
            );
            addToast({
              type: "error",
              message: `Failed to upload "${item.file.name}": ${errMsg}`,
            });
          }
        },
      }
    );
  };

  // Retry failed upload for a single photo
  const handleRetryPhotoUpload = async (photoId) => {
    const photo = modalPhotos.find((p) => p.id === photoId);
    if (!photo || !photo.file) return;

    setModalPhotos((prev) =>
      prev.map((p) =>
        p.id === photoId ? { ...p, uploadStatus: "uploading", uploadProgress: 0, uploadError: null } : p
      )
    );

    try {
      const permanentUrl = await uploadPhotoFile(photo.file, (percent, stage) => {
        setModalPhotos((prev) =>
          prev.map((p) => (p.id === photoId ? { ...p, uploadProgress: percent, uploadStatus: stage } : p))
        );
      });

      setModalPhotos((prev) =>
        prev.map((p) =>
          p.id === photoId
            ? { ...p, url: permanentUrl, uploadStatus: "complete", uploadProgress: 100, uploadError: null }
            : p
        )
      );
    } catch (err) {
      setModalPhotos((prev) =>
        prev.map((p) =>
          p.id === photoId
            ? { ...p, uploadStatus: "failed", uploadError: err.message || "Retry failed" }
            : p
        )
      );
      addToast({ type: "error", message: `Retry failed: ${err.message}` });
    }
  };

  // Retry all failed uploads in the staged photos concurrently
  const handleRetryAllFailedPhotos = async () => {
    const failedItems = modalPhotos.filter(
      (p) => p.uploadStatus === "failed" && p.file && !p.isMarkedForRemoval
    );
    if (failedItems.length === 0) return;

    setModalPhotos((prev) =>
      prev.map((p) =>
        failedItems.some((f) => f.id === p.id)
          ? { ...p, uploadStatus: "queued", uploadProgress: 0, uploadError: null }
          : p
      )
    );

    await uploadFilesWithConcurrency(
      failedItems,
      async (item) => {
        const permanentUrl = await uploadPhotoFile(item.file, (percent, stage) => {
          setModalPhotos((prev) =>
            prev.map((p) =>
              p.id === item.id ? { ...p, uploadProgress: percent, uploadStatus: stage } : p
            )
          );
        });

        setModalPhotos((prev) =>
          prev.map((p) =>
            p.id === item.id
              ? { ...p, url: permanentUrl, uploadStatus: "complete", uploadProgress: 100, uploadError: null }
              : p
          )
        );
        return permanentUrl;
      },
      {
        concurrency: DEFAULT_MAX_CONCURRENT_UPLOADS,
        onStart: (item) => {
          setModalPhotos((prev) =>
            prev.map((p) =>
              p.id === item.id
                ? { ...p, uploadStatus: "uploading", uploadProgress: 0, uploadError: null }
                : p
            )
          );
        },
        onComplete: (result, item) => {
          if (result.status === "rejected") {
            const errMsg = result.reason?.message || "Retry failed";
            setModalPhotos((prev) =>
              prev.map((p) =>
                p.id === item.id ? { ...p, uploadStatus: "failed", uploadError: errMsg } : p
              )
            );
            addToast({
              type: "error",
              message: `Retry failed for "${item.file.name}": ${errMsg}`,
            });
          }
        },
      }
    );
  };

  // Trigger file picker to replace a specific photo
  const handleTriggerReplace = (photoId) => {
    setReplacingPhotoId(photoId);
    if (replaceFileInputRef.current) {
      replaceFileInputRef.current.value = "";
      replaceFileInputRef.current.click();
    }
  };

  // Handle selected replacement file
  const handleReplaceFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (replaceFileInputRef.current) {
      replaceFileInputRef.current.value = "";
    }
    if (!file || !replacingPhotoId) return;

    const validMimes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
      "image/avif",
    ];
    const isImage = validMimes.includes(file.type) || file.type.startsWith("image/");
    if (!isImage) {
      addToast({ type: "error", message: "Please select a supported image file (JPEG, PNG, WEBP, AVIF)." });
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      addToast({ type: "error", message: "Replacement image exceeds 25MB limit." });
      return;
    }

    const targetId = replacingPhotoId;
    const tempUrl = URL.createObjectURL(file);

    setModalPhotos((prev) =>
      prev.map((p) => {
        if (p.id === targetId) {
          return {
            ...p,
            url: tempUrl,
            originalUrl: p.originalUrl || p.url,
            isReplaced: true,
            uploadStatus: "uploading",
            uploadProgress: 0,
            uploadError: null,
            replacementFile: file,
          };
        }
        return p;
      })
    );

    try {
      const permanentUrl = await uploadPhotoFile(file, (percent, stage) => {
        setModalPhotos((prev) =>
          prev.map((p) =>
            p.id === targetId ? { ...p, uploadProgress: percent, uploadStatus: stage } : p
          )
        );
      });

      setModalPhotos((prev) =>
        prev.map((p) =>
          p.id === targetId
            ? {
                ...p,
                url: permanentUrl,
                uploadStatus: "complete",
                uploadProgress: 100,
              }
            : p
        )
      );
      addToast({ type: "success", message: "Photo replaced. Click Save Changes to commit." });
    } catch (err) {
      setModalPhotos((prev) =>
        prev.map((p) =>
          p.id === targetId
            ? {
                ...p,
                uploadStatus: "failed",
                uploadError: err.message || "Failed to upload replacement",
              }
            : p
        )
      );
      addToast({ type: "error", message: `Failed to upload replacement: ${err.message}` });
    } finally {
      setReplacingPhotoId(null);
    }
  };

  // Toggle mark for removal with undo support
  const handleToggleRemovePhoto = (photoId) => {
    setModalPhotos((prev) =>
      prev.map((p) => (p.id === photoId ? { ...p, isMarkedForRemoval: !p.isMarkedForRemoval } : p))
    );
  };

  // Handle Cover Image direct device upload
  const handleCoverFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (coverFileInputRef.current) {
      coverFileInputRef.current.value = "";
    }
    if (!file) return;

    // Validate supported image file types
    const validMimes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
      "image/avif",
    ];
    const isImage = validMimes.includes(file.type) || file.type.startsWith("image/");
    if (!isImage) {
      const errMsg = "Please select a supported image file (JPEG, PNG, WEBP, AVIF).";
      setCoverUploadError(errMsg);
      addToast({ type: "error", message: errMsg });
      return;
    }

    // Validate size limit: 25MB
    const maxBytes = 25 * 1024 * 1024;
    if (file.size > maxBytes) {
      const errMsg = "Cover image exceeds the maximum allowed size of 25MB.";
      setCoverUploadError(errMsg);
      addToast({ type: "error", message: errMsg });
      return;
    }

    setCoverUploadError(null);
    if (formErrors.coverImage) {
      setFormErrors((prev) => ({ ...prev, coverImage: null }));
    }

    // Temporary preview for immediate upload feedback
    const tempUrl = URL.createObjectURL(file);
    setCoverTempPreview(tempUrl);
    setCoverUploading(true);
    setCoverProgress(0);

    const uploadFormData = new FormData();
    uploadFormData.append("file", file);
    uploadFormData.append("category", "gallery/albums");

    try {
      const permanentUrl = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", "/api/uploads");

        const token = localStorage.getItem("subash_admin_token");
        if (token) {
          xhr.setRequestHeader("Authorization", `Bearer ${token}`);
        }

        xhr.upload.onprogress = (evt) => {
          if (evt.lengthComputable) {
            const percent = Math.round((evt.loaded / evt.total) * 100);
            setCoverProgress(percent);
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const data = JSON.parse(xhr.responseText);
              if (data.url) {
                resolve(data.url);
              } else {
                reject(new Error("Upload succeeded but no image URL was returned."));
              }
            } catch (err) {
              reject(new Error("Invalid response format from upload server."));
            }
          } else {
            let errMsg = `Upload failed (${xhr.status})`;
            try {
              const parsed = JSON.parse(xhr.responseText);
              if (parsed.error) errMsg = parsed.error;
            } catch {}
            reject(new Error(errMsg));
          }
        };

        xhr.onerror = () => {
          reject(new Error("Network error during cover image upload."));
        };

        xhr.send(uploadFormData);
      });

      // ONLY store the permanent server URL with the album
      setFormData((prev) => ({ ...prev, coverImage: permanentUrl }));
      addToast({ type: "success", message: "Cover image uploaded successfully." });
    } catch (err) {
      const msg = err.message || "Failed to upload cover image.";
      setCoverUploadError(msg);
      addToast({ type: "error", message: msg });
    } finally {
      setCoverUploading(false);
      URL.revokeObjectURL(tempUrl);
      setCoverTempPreview(null);
    }
  };

  const handleRemoveCover = () => {
    setFormData((prev) => ({ ...prev, coverImage: "" }));
    setCoverUploadError(null);
    if (coverFileInputRef.current) {
      coverFileInputRef.current.value = "";
    }
  };

  // Open Manage Photos Modal
  const handleOpenManagePhotos = async (album) => {
    try {
      const fullAlbum = await getAlbumDetail(album.slug || album.id);
      setActiveAlbumForPhotos(fullAlbum || album);
    } catch {
      setActiveAlbumForPhotos(album);
    }
    setUploadQueue([]);
    setManagePhotosModalOpen(true);
  };

  // Handle album form validation & submit
  const handleSaveAlbum = async (e) => {
    e.preventDefault();
    if (coverUploading) {
      addToast({
        type: "warning",
        message: "Please wait for the cover image upload to complete.",
      });
      return;
    }
    if (editPhotosLoading) {
      addToast({
        type: "warning",
        message: "Please wait for album photos to finish loading.",
      });
      return;
    }
    if (submitting) return;

    // Check if any photo is currently queued, uploading, or optimizing
    if (isAnyPhotoUploading) {
      addToast({
        type: "warning",
        message: "Please wait for photo uploads to complete before saving.",
      });
      return;
    }

    // Check for failed photo uploads
    const failedUploads = modalPhotos.filter(
      (p) => p.uploadStatus === "failed" && !p.isMarkedForRemoval
    );
    if (failedUploads.length > 0) {
      addToast({
        type: "error",
        message: `${failedUploads.length} photo(s) failed to upload. Please retry or remove them before saving.`,
      });
      return;
    }

    const errors = {};

    const trimmedTitle = (formData.title || "").trim();
    const trimmedCategory = (formData.category || "").trim();
    const trimmedCover = (formData.coverImage || "").trim();
    const trimmedDescription = (formData.description || "").trim();

    if (!trimmedTitle) {
      errors.title = "Lead / Event Name is required.";
    }
    if (!trimmedCategory) {
      errors.category = "Category selection is required.";
    }
    if (!trimmedDescription) {
      errors.description = "Description / Editorial Notes are required.";
    }

    const activePhotos = modalPhotos.filter((p) => !p.isMarkedForRemoval);

    // Validation for publishing
    if (formData.published) {
      const hasCover = Boolean(trimmedCover);
      if (!hasCover) {
        errors.coverImage = "A cover image is required before publishing.";
      }
      if (activePhotos.length === 0) {
        errors.photos = "At least one album photo is required before publishing.";
      }
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      addToast({
        type: "error",
        message: Object.values(errors)[0],
      });
      return;
    }

    setSubmitting(true);
    try {
      if (editingAlbum) {
        // 1. Process removals for original photos marked for removal
        const toRemove = modalPhotos.filter((p) => p.isOriginal && p.isMarkedForRemoval);
        for (const item of toRemove) {
          await removePhotoFromAlbum(editingAlbum.id, item.id);
        }

        // 2. Process replacements for original photos that were replaced and not marked for removal
        const toUpdate = modalPhotos.filter(
          (p) => p.isOriginal && !p.isMarkedForRemoval && p.isReplaced
        );
        for (const item of toUpdate) {
          await updateAlbumPhoto(editingAlbum.id, item.id, {
            url: item.url,
            caption: item.caption,
            aspect: item.aspect,
          });
        }

        // 3. Process new additions
        const toAdd = modalPhotos.filter((p) => p.isNew && !p.isMarkedForRemoval);
        if (toAdd.length > 0) {
          const payload = toAdd.map((p, idx) => ({
            url: p.url,
            caption: p.caption || "",
            aspect: p.aspect || "portrait",
            order: typeof p.order === "number" ? p.order : (modalPhotos.length + idx),
          }));
          await addPhotosToAlbum(editingAlbum.id, payload);
        }

        // 4. Update album metadata & cover
        await updateAlbum(editingAlbum.id, {
          title: trimmedTitle,
          category: trimmedCategory,
          coverImage: trimmedCover,
          description: formData.description,
          published: formData.published,
        });

        addToast({ type: "success", message: `Updated album "${trimmedTitle}".` });
      } else {
        // Create new album
        const initialPhotos = activePhotos.map((p, idx) => ({
          url: p.url,
          caption: p.caption || "",
          aspect: p.aspect || "portrait",
          order: idx,
        }));

        await addAlbum({
          title: trimmedTitle,
          category: trimmedCategory,
          coverImage: trimmedCover,
          description: formData.description,
          published: formData.published,
          photos: initialPhotos,
        });

        addToast({ type: "success", message: `Created album "${trimmedTitle}".` });
      }

      handleCloseAlbumModal();
      refetchAlbums();
    } catch (err) {
      addToast({
        type: "error",
        message: err.message || "Failed to save album.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Handle single file upload to server
  const uploadSingleFile = async (fileItem) => {
    const formDataObj = new FormData();
    formDataObj.append("file", fileItem.file);
    formDataObj.append("category", "gallery/albums");

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", "/api/uploads");

      const token = localStorage.getItem("subash_admin_token");
      if (token) {
        xhr.setRequestHeader("Authorization", `Bearer ${token}`);
      }

      xhr.upload.onprogress = (evt) => {
        if (evt.lengthComputable) {
          const percent = Math.round((evt.loaded / evt.total) * 100);
          setUploadQueue((prev) =>
            prev.map((item) =>
              item.id === fileItem.id
                ? {
                    ...item,
                    progress: percent,
                    status: percent >= 100 ? "optimizing" : "uploading",
                  }
                : item
            )
          );
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data = JSON.parse(xhr.responseText);
            if (data.url) {
              setUploadQueue((prev) =>
                prev.map((item) =>
                  item.id === fileItem.id
                    ? { ...item, progress: 100, status: "complete", resultUrl: data.url }
                    : item
                )
              );
              resolve(data.url);
            } else {
              throw new Error("Invalid response from upload server.");
            }
          } catch (e) {
            setUploadQueue((prev) =>
              prev.map((item) =>
                item.id === fileItem.id
                  ? { ...item, status: "failed", error: e.message }
                  : item
              )
            );
            reject(e);
          }
        } else {
          let errMsg = `Upload failed (${xhr.status})`;
          try {
            const parsed = JSON.parse(xhr.responseText);
            if (parsed.error) errMsg = parsed.error;
          } catch {}
          setUploadQueue((prev) =>
            prev.map((item) =>
              item.id === fileItem.id
                ? { ...item, status: "failed", error: errMsg }
                : item
            )
          );
          reject(new Error(errMsg));
        }
      };

      xhr.onerror = () => {
        setUploadQueue((prev) =>
          prev.map((item) =>
            item.id === fileItem.id
              ? { ...item, status: "failed", error: "Network error during upload" }
              : item
          )
        );
        reject(new Error("Network error during upload"));
      };

      xhr.send(formDataObj);
    });
  };

  // Queue and upload files (controlled concurrent queue)
  const handleFilesChosen = async (filesList, destination = "managePhotos") => {
    if (!filesList || filesList.length === 0) return;

    const newItems = Array.from(filesList).map((file) => ({
      id: `up-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      file,
      name: file.name,
      preview: URL.createObjectURL(file),
      progress: 0,
      status: "queued", // "queued" | "uploading" | "optimizing" | "complete" | "failed"
      error: null,
      resultUrl: null,
    }));

    setUploadQueue((prev) => [...prev, ...newItems]);

    await uploadFilesWithConcurrency(
      newItems,
      async (item) => {
        const url = await uploadSingleFile(item);

        if (destination === "managePhotos" && activeAlbumForPhotos) {
          // Add to live album
          await addPhotosToAlbum(activeAlbumForPhotos.id, [{ url, aspect: "portrait" }]);
          const refreshed = await getAlbumDetail(activeAlbumForPhotos.id);
          setActiveAlbumForPhotos(refreshed);
        } else if (destination === "addModal") {
          // Add to initialPhotos
          setFormData((prev) => ({
            ...prev,
            initialPhotos: [
              ...prev.initialPhotos,
              { url, caption: "", aspect: "portrait" },
            ],
          }));
        }
        return url;
      },
      {
        concurrency: DEFAULT_MAX_CONCURRENT_UPLOADS,
        onStart: (item) => {
          setUploadQueue((prev) =>
            prev.map((it) => (it.id === item.id ? { ...it, status: "uploading", progress: 0 } : it))
          );
        },
        onComplete: (result, item) => {
          if (result.status === "rejected") {
            console.warn("Upload failed for item:", item.name, result.reason?.message);
          }
        },
      }
    );
  };

  // Retry failed uploads (controlled concurrent queue)
  const handleRetryFailedUploads = async (destination = "managePhotos") => {
    const failedItems = uploadQueue.filter((it) => it.status === "failed");
    if (failedItems.length === 0) return;

    setUploadQueue((prev) =>
      prev.map((it) =>
        failedItems.some((f) => f.id === it.id)
          ? { ...it, status: "queued", error: null, progress: 0 }
          : it
      )
    );

    await uploadFilesWithConcurrency(
      failedItems,
      async (item) => {
        const url = await uploadSingleFile(item);

        if (destination === "managePhotos" && activeAlbumForPhotos) {
          await addPhotosToAlbum(activeAlbumForPhotos.id, [{ url, aspect: "portrait" }]);
          const refreshed = await getAlbumDetail(activeAlbumForPhotos.id);
          setActiveAlbumForPhotos(refreshed);
        } else if (destination === "addModal") {
          setFormData((prev) => ({
            ...prev,
            initialPhotos: [
              ...prev.initialPhotos,
              { url, caption: "", aspect: "portrait" },
            ],
          }));
        }
        return url;
      },
      {
        concurrency: DEFAULT_MAX_CONCURRENT_UPLOADS,
        onStart: (item) => {
          setUploadQueue((prev) =>
            prev.map((it) =>
              it.id === item.id ? { ...it, status: "uploading", error: null, progress: 0 } : it
            )
          );
        },
        onComplete: (result, item) => {
          if (result.status === "rejected") {
            console.warn("Retry failed for item:", item.name, result.reason?.message);
          }
        },
      }
    );
  };

  // Remove photo from album in Manage Photos
  const handleRemovePhoto = async (photoId) => {
    if (!activeAlbumForPhotos) return;
    try {
      await removePhotoFromAlbum(activeAlbumForPhotos.id, photoId);
      const refreshed = await getAlbumDetail(activeAlbumForPhotos.id);
      setActiveAlbumForPhotos(refreshed);
      addToast({ type: "success", message: "Photograph removed from album." });
    } catch (err) {
      addToast({ type: "error", message: err.message || "Failed to remove photo." });
    }
  };

  // Set photo as cover
  const handleSetCover = async (photoUrl) => {
    if (!activeAlbumForPhotos) return;
    try {
      await setAlbumCover(activeAlbumForPhotos.id, photoUrl);
      setActiveAlbumForPhotos((prev) => ({ ...prev, coverImage: photoUrl }));
      addToast({ type: "success", message: "Cover image updated for this album." });
    } catch (err) {
      addToast({ type: "error", message: err.message || "Failed to set cover." });
    }
  };

  // Reorder photos (move item left/right)
  const handleMovePhoto = async (index, direction) => {
    if (!activeAlbumForPhotos || !activeAlbumForPhotos.photos) return;
    const photos = [...activeAlbumForPhotos.photos];
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= photos.length) return;

    // Swap elements
    const temp = photos[index];
    photos[index] = photos[targetIndex];
    photos[targetIndex] = temp;

    // Build photoOrders array
    const photoOrders = photos.map((p, idx) => ({ id: p.id, order: idx }));

    // Optimistic update
    setActiveAlbumForPhotos((prev) => ({ ...prev, photos }));

    try {
      await reorderAlbumPhotos(activeAlbumForPhotos.id, photoOrders);
    } catch (err) {
      addToast({ type: "error", message: "Failed to persist new photo order." });
      const refreshed = await getAlbumDetail(activeAlbumForPhotos.id);
      setActiveAlbumForPhotos(refreshed);
    }
  };

  // Toggle publishing from card
  const handleTogglePublish = async (album) => {
    try {
      const updated = await toggleAlbumPublished(album.id);
      addToast({
        type: "success",
        message: updated.published
          ? `Published album "${album.title}".`
          : `Unpublished album "${album.title}" (Draft).`,
      });
    } catch (err) {
      addToast({
        type: "error",
        message: err.message || "Failed to toggle publishing status.",
      });
    }
  };

  // Delete album
  const handleConfirmDelete = async () => {
    if (!albumToDelete) return;
    try {
      await deleteAlbum(albumToDelete.id);
      addToast({
        type: "success",
        message: `Deleted album "${albumToDelete.title}".`,
      });
      setDeleteConfirmOpen(false);
      setAlbumToDelete(null);
    } catch (err) {
      addToast({
        type: "error",
        message: err.message || "Failed to delete album.",
      });
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* =========================================================================
          PAGE HEADER
      ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2.5 rounded-xl bg-purple-50 border border-purple-100 text-purple-600">
              <FolderHeart size={18} />
            </span>
            <h1 className="font-display text-2xl text-gray-900 font-semibold tracking-tight">
              Gallery Albums Management
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-gray-500">
            Curate client event albums, upload mixed-size photos with reordering, and manage showcase categories.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setManageCategoriesModalOpen(true)}
            className="px-4 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-xs font-medium text-gray-700 transition-colors flex items-center gap-2 bg-white shadow-xs"
          >
            <SlidersHorizontal size={14} className="text-gray-500" />
            <span>Categories</span>
          </button>

          <button
            onClick={handleOpenCreate}
            className="px-5 py-2.5 rounded-xl bg-black hover:bg-gray-800 text-white text-xs font-medium transition-colors shadow-xs flex items-center gap-2"
          >
            <Plus size={16} />
            <span>Add Album</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          TOOLBAR: SEARCH, CATEGORIES, STATUS FILTER
      ========================================================================= */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search albums by title, category, or notes..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-gray-200 bg-gray-50/50 focus:outline-none focus:border-black focus:ring-1 focus:ring-black/10 focus:bg-white transition-all text-gray-900 placeholder:text-gray-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 font-medium hidden sm:inline">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 text-xs rounded-xl border border-gray-200 bg-gray-50/50 text-gray-900 focus:outline-none focus:border-black font-medium"
            >
              <option value="all">All Albums ({albums.length})</option>
              <option value="published">Published Only ({albums.filter((a) => a.published).length})</option>
              <option value="draft">Drafts Only ({albums.filter((a) => !a.published).length})</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1 border-t border-gray-100">
          <button
            onClick={() => {
              setSelectedCategory("All");
              setCurrentPage(1);
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all border ${
              selectedCategory === "All"
                ? "bg-black text-white border-black shadow-xs"
                : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
            }`}
          >
            All Categories ({albums.length})
          </button>

          {activeCategoryNames.map((cat) => {
            const count = albums.filter(
              (a) => (a.category || "").toLowerCase() === cat.toLowerCase()
            ).length;
            const isSelected = selectedCategory.toLowerCase() === cat.toLowerCase();

            return (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat);
                  setCurrentPage(1);
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all border flex items-center gap-1.5 ${
                  isSelected
                    ? "bg-black text-white border-black shadow-xs"
                    : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                }`}
              >
                <span>{cat}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  isSelected ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600"
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* =========================================================================
          ALBUMS GRID
      ========================================================================= */}
      {paginatedAlbums.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedAlbums.map((album) => {
            const photoCount =
              album.photoCount ||
              album._count?.photos ||
              album.photos?.length ||
              0;

            return (
              <div
                key={album.id}
                className="bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col group"
              >
                {/* Cover Image Header */}
                <div className="relative aspect-[16/10] bg-gray-100 overflow-hidden">
                  <img
                    src={album.coverImage || "/images/placeholder.jpg"}
                    alt={album.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => {
                      e.currentTarget.src = "/images/gallery/wedding/wedding-01.jpg";
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

                  {/* Category Pill Top Left */}
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 rounded-full text-[10px] uppercase font-semibold tracking-wider bg-white/95 text-gray-800 border border-gray-200 shadow-xs backdrop-blur-md">
                      {album.category}
                    </span>
                  </div>

                  {/* Published / Draft Toggle Top Right */}
                  <div className="absolute top-3 right-3">
                    <button
                      onClick={() => handleTogglePublish(album)}
                      className={`px-2.5 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider flex items-center gap-1 shadow-sm backdrop-blur-md transition-colors ${
                        album.published
                          ? "bg-emerald-500/90 hover:bg-emerald-600 text-white"
                          : "bg-amber-500/90 hover:bg-amber-600 text-white"
                      }`}
                      title={album.published ? "Click to set as Draft" : "Click to Publish"}
                    >
                      {album.published ? <Eye size={11} /> : <EyeOff size={11} />}
                      <span>{album.published ? "Published" : "Draft"}</span>
                    </button>
                  </div>

                  {/* Photo Count Bottom Left */}
                  <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-black/60 text-white backdrop-blur-md">
                    <Camera size={12} className="text-gray-300" />
                    <span>{photoCount} {photoCount === 1 ? "Photo" : "Photos"}</span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="font-display text-lg text-gray-900 font-semibold leading-snug line-clamp-1">
                      {album.title}
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5 font-mono">
                      /{album.slug || album.id}
                    </p>
                    {album.description && (
                      <p className="text-xs text-gray-500 mt-2 line-clamp-2 leading-relaxed">
                        {album.description}
                      </p>
                    )}
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-4 border-t border-gray-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => handleOpenManagePhotos(album)}
                      className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-gray-50 border border-gray-200 text-xs font-medium text-gray-700 transition-colors flex items-center gap-1.5 shadow-xs"
                    >
                      <Images size={13} className="text-gray-500" />
                      <span>Manage Photos</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenEdit(album)}
                        className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
                        title="Edit Album Details"
                      >
                        <Edit3 size={15} />
                      </button>

                      <button
                        onClick={() => {
                          setAlbumToDelete(album);
                          setDeleteConfirmOpen(true);
                        }}
                        className="p-2 rounded-xl hover:bg-rose-50 text-gray-400 hover:text-rose-600 transition-colors"
                        title="Delete Album"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={FolderHeart}
          title="No Albums Found"
          description={
            searchQuery || selectedCategory !== "All" || statusFilter !== "all"
              ? "No albums match your current filters. Try resetting the search or category."
              : "No event albums have been created yet. Click 'Add Album' to create your first client showcase album."
          }
          actionLabel="Add First Album"
          onAction={handleOpenCreate}
        />
      )}

      {/* Pagination */}
      {filteredAlbums.length > pageSize && (
        <Pagination
          currentPage={currentPage}
          totalItems={filteredAlbums.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
        />
      )}

      {/* =========================================================================
          MODAL 1: ADD / EDIT ALBUM MODAL
      ========================================================================= */}
      {createPortal(
        <AnimatePresence>
          {albumModalOpen && (
            <div
              className="admin-portal fixed inset-0 z-[99990] flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm overflow-hidden"
              role="dialog"
              aria-modal="true"
              aria-labelledby="album-dialog-title"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 8 }}
                transition={{ duration: 0.2 }}
                className="bg-white rounded-2xl max-w-[800px] w-full max-h-[calc(100dvh-48px)] sm:max-h-[calc(100dvh-64px)] my-auto flex flex-col border border-gray-200 shadow-xl relative overflow-hidden"
              >
                {/* Viewport-pinned Header */}
                <div className="shrink-0 px-5 py-4 sm:px-7 sm:py-5 border-b border-gray-100 flex items-center justify-between bg-white z-10">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shrink-0">
                      <FolderPlus size={20} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h2 id="album-dialog-title" className="font-display text-xl sm:text-2xl text-gray-900 font-semibold truncate">
                          {editingAlbum ? "Edit Album" : "Add Album"}
                        </h2>
                        <span className="shrink-0 px-2.5 py-0.5 rounded-full text-[10px] uppercase font-semibold tracking-wider bg-gray-100 text-gray-700 border border-gray-200">
                          {editingAlbum ? "Edit" : "New"}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5 truncate">
                        {editingAlbum
                          ? `Update event details and photographs for "${editingAlbum.title}"`
                          : "Configure display title, category, cover image, and publishing status"}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleCloseAlbumModal}
                    aria-label="Close dialog"
                    className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors shrink-0 ml-2"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Form wrapping scrollable body and pinned footer */}
                <form
                  id="album-modal-form"
                  onSubmit={handleSaveAlbum}
                  className="flex-1 min-h-0 flex flex-col overflow-hidden"
                >
                  {/* Scrollable Form Body */}
                  <div className="flex-1 min-h-0 overflow-y-auto px-5 py-5 sm:px-7 sm:py-6 space-y-5">
                    {/* Lead / Event Name */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-900 uppercase tracking-wider mb-1.5">
                        Lead / Event Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Arun & Priya, Keerthana's Ceremony, Baby Aryan"
                        value={formData.title}
                        onChange={(e) => {
                          setFormData({ ...formData, title: e.target.value });
                          if (formErrors.title) setFormErrors({ ...formErrors, title: null });
                        }}
                        className={`w-full px-4 py-2.5 text-xs rounded-xl border ${
                          formErrors.title ? "border-rose-400 bg-rose-50/30" : "border-gray-200 bg-gray-50/50"
                        } focus:outline-none focus:border-black focus:ring-1 focus:ring-black/10 focus:bg-white text-gray-900 font-medium placeholder:text-gray-400`}
                      />
                      {formErrors.title && (
                        <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1 font-medium">
                          <AlertCircle size={12} className="shrink-0" />
                          <span>{formErrors.title}</span>
                        </p>
                      )}
                    </div>

                    {/* Category Select + Add Category Button */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-semibold text-gray-900 uppercase tracking-wider">
                          Category <span className="text-rose-500">*</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => setAddCategoryModalOpen(true)}
                          className="text-[11px] text-gray-900 hover:underline font-semibold flex items-center gap-1"
                        >
                          <Plus size={12} />
                          <span>New Category</span>
                        </button>
                      </div>
                      <select
                        value={formData.category}
                        onChange={(e) => {
                          setFormData({ ...formData, category: e.target.value });
                          if (formErrors.category) setFormErrors({ ...formErrors, category: null });
                        }}
                        className="w-full px-4 py-2.5 text-xs rounded-xl border border-gray-200 bg-gray-50/50 focus:outline-none focus:border-black focus:ring-1 focus:ring-black/10 focus:bg-white text-gray-900 font-medium"
                      >
                        <option value="">Select a Category...</option>
                        {activeCategoryNames.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                      {formErrors.category && (
                        <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1 font-medium">
                          <AlertCircle size={12} className="shrink-0" />
                          <span>{formErrors.category}</span>
                        </p>
                      )}
                    </div>

                    {/* Cover Image Upload (Direct Device Upload) */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-900 uppercase tracking-wider mb-1.5">
                        Cover Image {formData.published && <span className="text-rose-500">*</span>}
                      </label>

                      {/* Native Hidden File Input */}
                      <input
                        ref={coverFileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                        className="hidden"
                        onChange={handleCoverFileSelect}
                      />

                      {/* State 1: Uploading in progress */}
                      {coverUploading ? (
                        <div className="border border-gray-200 rounded-2xl p-5 bg-gray-50 space-y-3">
                          <div className="flex items-center gap-3">
                            {coverTempPreview ? (
                              <img
                                src={coverTempPreview}
                                alt="Uploading preview"
                                className="w-14 h-14 rounded-xl object-cover border border-gray-200 shrink-0"
                              />
                            ) : (
                              <div className="w-14 h-14 rounded-xl bg-white border border-gray-200 flex items-center justify-center shrink-0">
                                <UploadCloud size={20} className="text-gray-500 animate-pulse" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between text-xs mb-1.5">
                                <span className="font-semibold text-gray-900 flex items-center gap-1.5">
                                  <RefreshCw size={12} className="animate-spin text-gray-500" />
                                  Uploading cover image...
                                </span>
                                <span className="text-[11px] font-mono text-gray-500 font-bold">
                                  {coverProgress}%
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-black transition-all duration-200 rounded-full"
                                  style={{ width: `${coverProgress}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : formData.coverImage ? (
                        /* State 2: Cover image selected / saved (Compact 200-240px height without distortion) */
                        <div className="relative h-[210px] max-h-[240px] w-full rounded-2xl overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center group">
                          <img
                            src={formData.coverImage}
                            alt="Cover Preview"
                            className="w-full h-full object-contain"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                            <button
                              type="button"
                              onClick={() => coverFileInputRef.current?.click()}
                              className="px-4 py-2 rounded-xl bg-white text-xs font-semibold text-gray-900 hover:bg-gray-100 transition-colors flex items-center gap-1.5 shadow-sm"
                            >
                              <Camera size={13} />
                              <span>Change Image</span>
                            </button>
                            <button
                              type="button"
                              onClick={handleRemoveCover}
                              className="p-2 rounded-xl bg-rose-600 text-white hover:bg-rose-700 transition-colors shadow-sm"
                              title="Remove Cover Image"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* State 3: Empty field - Click to upload from device */
                        <div
                          onClick={() => coverFileInputRef.current?.click()}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              coverFileInputRef.current?.click();
                            }
                          }}
                          tabIndex={0}
                          role="button"
                          aria-label="Upload Cover Image. Choose Image from Device"
                          className={`border-2 border-dashed rounded-2xl p-6 sm:p-7 text-center cursor-pointer transition-all ${
                            formErrors.coverImage || coverUploadError
                              ? "border-rose-400 bg-rose-50/20 hover:border-rose-500"
                              : "border-gray-200 bg-gray-50/50 hover:border-gray-400 hover:bg-gray-100/50"
                          } flex flex-col items-center justify-center gap-2 group`}
                        >
                          <div className="w-12 h-12 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-600 group-hover:scale-105 transition-transform shadow-xs">
                            <UploadCloud size={22} />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">
                              Upload Cover Image
                            </p>
                            <p className="text-xs text-gray-600 font-medium mt-0.5">
                              Choose Image from Device
                            </p>
                            <p className="text-[11px] text-gray-400 mt-1">
                              Supports JPEG, PNG, WEBP up to 25MB
                            </p>
                          </div>
                        </div>
                      )}

                      {coverUploadError && (
                        <p className="text-[11px] text-rose-500 mt-1.5 flex items-center gap-1 font-medium">
                          <AlertCircle size={12} className="shrink-0" />
                          <span>{coverUploadError}</span>
                        </p>
                      )}
                      {formErrors.coverImage && (
                        <p className="text-[11px] text-rose-500 mt-1.5 flex items-center gap-1 font-medium">
                          <AlertCircle size={12} className="shrink-0" />
                          <span>{formErrors.coverImage}</span>
                        </p>
                      )}
                    </div>

                    {/* Album Photos Section (Unified Add & Edit with Add, Replace, Delete/Undo, Preview) */}
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <label className="block text-xs font-semibold text-gray-900 uppercase tracking-wider">
                            Album Photos ({activePhotosCount}) {formData.published && <span className="text-rose-500">*</span>}
                          </label>
                          {pendingRemovalCount > 0 && (
                            <span className="text-[10px] font-semibold text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                              {pendingRemovalCount} marked for removal
                            </span>
                          )}
                          {pendingReplacedCount > 0 && (
                            <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                              {pendingReplacedCount} replaced
                            </span>
                          )}
                          {pendingUploadingCount > 0 && (
                            <span className="text-[10px] font-semibold text-gray-700 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-black animate-ping" />
                              {pendingUploadingCount} uploading / queued
                            </span>
                          )}
                          {failedUploadsCount > 0 && (
                            <button
                              type="button"
                              onClick={handleRetryAllFailedPhotos}
                              className="text-[10px] font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-2 py-0.5 rounded-full flex items-center gap-1 transition-colors"
                            >
                              <RefreshCw size={10} />
                              <span>Retry {failedUploadsCount} Failed</span>
                            </button>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => openMediaPicker("photos")}
                          className="text-[11px] text-gray-900 hover:underline font-semibold flex items-center gap-1 transition-colors"
                        >
                          <ImageIcon size={12} />
                          <span>Pick From Media Library</span>
                        </button>
                      </div>

                      {/* Native Multi-File Picker Input */}
                      <input
                        ref={photosFileInputRef}
                        type="file"
                        multiple
                        accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                        className="hidden"
                        onChange={handleAddModalPhotosSelect}
                      />

                      {/* Native Hidden File Input for Single Photo Replacement */}
                      <input
                        ref={replaceFileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                        className="hidden"
                        onChange={handleReplaceFileSelect}
                      />

                      {/* Add Photos Dropzone / Trigger */}
                      <div
                        onClick={() => photosFileInputRef.current?.click()}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            photosFileInputRef.current?.click();
                          }
                        }}
                        tabIndex={0}
                        role="button"
                        aria-label="Add Photos. Choose multiple images from device"
                        className="border-2 border-dashed border-gray-200 hover:border-gray-400 rounded-xl p-4 text-center cursor-pointer bg-gray-50/50 hover:bg-gray-100/50 transition-all flex items-center justify-center gap-3 group"
                      >
                        <div className="w-9 h-9 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-600 group-hover:scale-105 transition-transform shrink-0 shadow-xs">
                          <Camera size={18} />
                        </div>
                        <div className="text-left">
                          <p className="text-xs font-semibold text-gray-900">
                            Add Photos <span className="font-normal text-gray-500">— Select multiple images from device</span>
                          </p>
                          <p className="text-[10px] text-gray-400 mt-0.5">
                            Supports JPEG, PNG, WEBP up to 25MB each. Mixed aspect ratios preserved.
                          </p>
                        </div>
                      </div>

                      {/* Loading State for Edit Album */}
                      {editPhotosLoading && (
                        <div className="p-8 rounded-xl border border-gray-200 bg-gray-50 text-center space-y-2">
                          <RefreshCw size={24} className="mx-auto animate-spin text-gray-500" />
                          <p className="text-xs font-semibold text-gray-900">Loading album photographs...</p>
                          <p className="text-[11px] text-gray-500">Retrieving existing photos from storage</p>
                        </div>
                      )}

                      {/* Error State for Edit Album */}
                      {!editPhotosLoading && editPhotosError && (
                        <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/50 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <AlertCircle size={16} className="text-rose-500 shrink-0" />
                            <div>
                              <p className="text-xs font-semibold text-rose-800">Failed to load album photos</p>
                              <p className="text-[11px] text-rose-600">{editPhotosError}</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={handleRetryFetchAlbumPhotos}
                            className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shrink-0"
                          >
                            Retry
                          </button>
                        </div>
                      )}

                      {/* Responsive Thumbnail Grid */}
                      {!editPhotosLoading && !editPhotosError && modalPhotos.length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 max-h-[320px] overflow-y-auto p-2 bg-gray-50 rounded-xl border border-gray-200">
                          {modalPhotos.map((photo, index) => {
                            const isQueued = photo.uploadStatus === "queued";
                            const isUploading = photo.uploadStatus === "uploading";
                            const isOptimizing = photo.uploadStatus === "optimizing";
                            const isFailed = photo.uploadStatus === "failed";
                            const isMarked = photo.isMarkedForRemoval;
                            const isReplaced = photo.isReplaced;
                            const isNew = photo.isNew;

                            return (
                              <div
                                key={photo.id || index}
                                className={`group relative aspect-square rounded-lg overflow-hidden border bg-white shadow-xs transition-all ${
                                  isMarked
                                    ? "border-rose-400 opacity-60 grayscale ring-2 ring-rose-200"
                                    : isReplaced
                                    ? "border-amber-400 ring-2 ring-amber-100"
                                    : isNew
                                    ? "border-emerald-400 ring-1 ring-emerald-100"
                                    : "border-gray-200 hover:border-gray-400"
                                }`}
                              >
                                {/* Thumbnail Image */}
                                <img
                                  src={photo.url}
                                  alt={photo.caption || `Photograph ${index + 1}`}
                                  className="w-full h-full object-cover cursor-pointer"
                                  onClick={() => setPreviewPhotoUrl(photo.url)}
                                  title="Click to view larger preview"
                                />

                                {/* Position Order Badge */}
                                <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-xs text-[10px] font-mono font-bold text-white pointer-events-none z-10">
                                  #{index + 1}
                                </div>

                                {/* Status Badges */}
                                {isReplaced && !isMarked && (
                                  <span className="absolute top-1 right-1 px-1.5 py-0.5 rounded bg-amber-500 text-white text-[9px] font-bold uppercase tracking-wider shadow z-10">
                                    Replaced
                                  </span>
                                )}
                                {isNew && !isMarked && (
                                  <span className="absolute top-1 right-1 px-1.5 py-0.5 rounded bg-emerald-600 text-white text-[9px] font-bold uppercase tracking-wider shadow z-10">
                                    New
                                  </span>
                                )}

                                {/* Queued / Waiting in Concurrency Pool Overlay */}
                                {isQueued && (
                                  <div className="absolute inset-0 bg-black/70 backdrop-blur-xs flex flex-col items-center justify-center p-2 text-white text-center z-20">
                                    <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin mb-1" />
                                    <span className="text-[10px] font-semibold text-gray-300">Waiting...</span>
                                  </div>
                                )}

                                {/* Optimizing Image Overlay */}
                                {isOptimizing && (
                                  <div className="absolute inset-0 bg-black/75 backdrop-blur-xs flex flex-col items-center justify-center p-2 text-white text-center z-20">
                                    <RefreshCw size={15} className="animate-spin text-white mb-1" />
                                    <span className="text-[10px] font-bold text-gray-200">Optimizing...</span>
                                  </div>
                                )}

                                {/* Uploading Overlay */}
                                {isUploading && (
                                  <div className="absolute inset-0 bg-black/75 backdrop-blur-xs flex flex-col items-center justify-center p-2 text-white text-center z-20">
                                    <RefreshCw size={15} className="animate-spin text-white mb-1" />
                                    <span className="text-[10px] font-bold">{photo.uploadProgress || 0}%</span>
                                    <div className="w-4/5 bg-white/20 h-1.5 rounded-full overflow-hidden mt-1">
                                      <div
                                        className="bg-white h-full transition-all duration-150"
                                        style={{ width: `${photo.uploadProgress || 0}%` }}
                                      />
                                    </div>
                                  </div>
                                )}

                                {/* Failed Upload Overlay */}
                                {isFailed && (
                                  <div className="absolute inset-0 bg-rose-950/85 backdrop-blur-xs flex flex-col items-center justify-center p-2 text-white text-center z-20">
                                    <AlertCircle size={15} className="text-rose-300 mb-0.5" />
                                    <span className="text-[10px] font-bold line-clamp-1">{photo.uploadError || "Upload Failed"}</span>
                                    <div className="flex items-center gap-1.5 mt-1.5">
                                      <button
                                        type="button"
                                        onClick={() => handleRetryPhotoUpload(photo.id)}
                                        className="px-2 py-0.5 rounded bg-white text-rose-800 text-[10px] font-bold hover:bg-rose-50"
                                      >
                                        Retry
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleToggleRemovePhoto(photo.id)}
                                        className="p-1 rounded bg-black/40 hover:bg-black/60 text-white"
                                        title="Remove"
                                      >
                                        <Trash2 size={11} />
                                      </button>
                                    </div>
                                  </div>
                                )}

                                {/* Marked for Removal Overlay */}
                                {isMarked && (
                                  <div className="absolute inset-0 bg-black/80 backdrop-blur-xs flex flex-col items-center justify-center p-2 text-white text-center z-20">
                                    <Trash2 size={16} className="text-rose-400 mb-0.5" />
                                    <span className="text-[10px] font-bold text-rose-300">Marked for removal</span>
                                    <button
                                      type="button"
                                      onClick={() => handleToggleRemovePhoto(photo.id)}
                                      className="mt-2 px-2.5 py-1 rounded-full bg-white text-gray-900 hover:bg-gray-100 text-[10px] font-bold flex items-center gap-1 shadow transition-colors"
                                    >
                                      <RotateCcw size={10} />
                                      <span>Undo</span>
                                    </button>
                                  </div>
                                )}

                                {/* Action Buttons on Hover */}
                                {!isUploading && !isFailed && !isMarked && (
                                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 p-1 z-10">
                                    {/* Preview */}
                                    <button
                                      type="button"
                                      onClick={() => setPreviewPhotoUrl(photo.url)}
                                      className="p-1.5 rounded-lg bg-white text-gray-900 hover:scale-105 transition-transform shadow-xs"
                                      title="View Larger Preview"
                                    >
                                      <Eye size={12} />
                                    </button>

                                    {/* Replace */}
                                    <button
                                      type="button"
                                      onClick={() => handleTriggerReplace(photo.id)}
                                      className="px-2 py-1 rounded-lg bg-white text-gray-900 hover:bg-gray-100 text-[10px] font-semibold flex items-center gap-1 shadow-xs transition-colors"
                                      title="Replace this photograph"
                                    >
                                      <Camera size={11} />
                                      <span>Replace</span>
                                    </button>

                                    {/* Remove */}
                                    <button
                                      type="button"
                                      onClick={() => handleToggleRemovePhoto(photo.id)}
                                      className="p-1.5 rounded-lg bg-rose-600 text-white hover:bg-rose-700 hover:scale-105 transition-transform shadow-xs"
                                      title="Remove Photograph"
                                    >
                                      <Trash2 size={12} />
                                    </button>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {formErrors.photos && (
                        <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1 font-medium">
                          <AlertCircle size={12} className="shrink-0" />
                          <span>{formErrors.photos}</span>
                        </p>
                      )}
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-900 uppercase tracking-wider mb-1.5">
                        Description / Editorial Notes <span className="text-rose-500">*</span>
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Detailed description of the event celebration, couple story or studio theme (required)..."
                        value={formData.description}
                        onChange={(e) => {
                          setFormData({ ...formData, description: e.target.value });
                          if (formErrors.description) setFormErrors({ ...formErrors, description: null });
                        }}
                        className={`w-full px-4 py-2.5 text-xs rounded-xl border ${
                          formErrors.description ? "border-rose-400 bg-rose-50/30" : "border-gray-200 bg-gray-50/50"
                        } focus:outline-none focus:border-black focus:ring-1 focus:ring-black/10 focus:bg-white text-gray-900 font-medium placeholder:text-gray-400`}
                      />
                      {formErrors.description && (
                        <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1 font-medium">
                          <AlertCircle size={12} className="shrink-0" />
                          <span>{formErrors.description}</span>
                        </p>
                      )}
                    </div>

                    {/* Publishing Status Toggle */}
                    <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold text-gray-900 uppercase tracking-wider">
                          Publishing Status
                        </p>
                        <p className="text-[11px] text-gray-500 mt-0.5">
                          {formData.published
                            ? "Visible on public /gallery showcase."
                            : "Draft: Hidden from public website."}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, published: !formData.published })}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          formData.published ? "bg-black" : "bg-gray-200"
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            formData.published ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Viewport-pinned Action Footer */}
                  <div className="shrink-0 px-5 py-3.5 sm:px-7 sm:py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-end gap-3 z-10">
                    <button
                      type="button"
                      onClick={handleCloseAlbumModal}
                      className="px-5 py-2.5 rounded-xl border border-gray-200 bg-white text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-xs"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting || coverUploading || editPhotosLoading || isAnyPhotoUploading}
                      className="px-6 py-2.5 rounded-xl bg-black hover:bg-gray-800 text-white text-xs font-medium transition-colors disabled:opacity-50 shadow-xs flex items-center gap-2"
                    >
                      {(submitting || coverUploading || editPhotosLoading || isAnyPhotoUploading) && (
                        <RefreshCw size={13} className="animate-spin" />
                      )}
                      <span>
                        {coverUploading
                          ? "Uploading Cover..."
                          : editPhotosLoading
                          ? "Loading Photos..."
                          : isAnyPhotoUploading
                          ? `Uploading Photos (${pendingUploadingCount})...`
                          : submitting
                          ? "Saving..."
                          : editingAlbum
                          ? "Save Changes"
                          : "Create Album"}
                      </span>
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* =========================================================================
          LIGHTBOX / LARGER PREVIEW MODAL
      ========================================================================= */}
      {createPortal(
        <AnimatePresence>
          {previewPhotoUrl && (
            <div
              className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
              onClick={() => setPreviewPhotoUrl(null)}
              role="dialog"
              aria-modal="true"
              aria-label="Enlarged Photo Preview"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.92 }}
                transition={{ duration: 0.18 }}
                className="relative max-w-4xl max-h-[90vh] flex flex-col items-center justify-center"
                onClick={(e) => e.stopPropagation()}
              >
                <img
                  src={previewPhotoUrl}
                  alt="Photograph Full Preview"
                  className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl border border-white/20"
                />
                <button
                  type="button"
                  onClick={() => setPreviewPhotoUrl(null)}
                  className="absolute -top-3 -right-3 p-2 rounded-full bg-white text-[#1C1B19] hover:bg-rose-600 hover:text-white shadow-xl transition-colors cursor-pointer"
                  title="Close Preview"
                >
                  <X size={18} />
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* =========================================================================
          MODAL 2: MANAGE PHOTOS MODAL (MULTI-UPLOAD, PROGRESS, RETRY, REORDER)
      ========================================================================= */}
      {createPortal(
        <AnimatePresence>
          {managePhotosModalOpen && activeAlbumForPhotos && (
            <div className="admin-portal fixed inset-0 z-[99990] flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm overflow-hidden">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-2xl p-6 sm:p-8 max-w-4xl w-full border border-gray-200 shadow-xl relative max-h-[calc(100dvh-24px)] sm:max-h-[calc(100dvh-48px)] flex flex-col overflow-hidden"
              >
                <button
                  onClick={() => setManagePhotosModalOpen(false)}
                  className="absolute top-6 right-6 p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors z-10"
                >
                  <X size={18} />
                </button>

                {/* Modal Header */}
                <div className="mb-6 pb-4 border-b border-gray-100 shrink-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-gray-100 text-gray-700 border border-gray-200">
                      {activeAlbumForPhotos.category}
                    </span>
                    <span className="text-xs text-gray-500">
                      📸 {activeAlbumForPhotos.photos?.length || 0} Photographs
                    </span>
                  </div>
                  <h2 className="font-display text-2xl text-gray-900 font-semibold">
                    Manage Photos: &ldquo;{activeAlbumForPhotos.title}&rdquo;
                  </h2>
                  <p className="text-xs text-gray-500 mt-1">
                    Upload multiple photos, view live progress, retry failures, reorder photos, and set the cover image.
                  </p>
                </div>

                {/* Modal Body: Scrollable */}
                <div className="flex-1 min-h-0 overflow-y-auto space-y-6 pr-1">
                  {/* Upload Action Zone */}
                  <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h4 className="text-xs font-semibold text-gray-900 uppercase tracking-wider">
                          Upload New Photos
                        </h4>
                        <p className="text-[11px] text-gray-500 mt-0.5">
                          Upload mixed aspect ratios (portrait, landscape, square). JPEG, PNG, WEBP up to 25MB.
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => openMediaPicker("photos")}
                          className="px-3.5 py-2 rounded-xl border border-gray-200 bg-white text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-1.5 shadow-xs"
                        >
                          <ImageIcon size={13} className="text-gray-500" />
                          <span>Media Library</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-4 py-2 rounded-xl bg-black hover:bg-gray-800 text-white text-xs font-medium transition-colors flex items-center gap-1.5 shadow-xs"
                        >
                          <UploadCloud size={14} />
                          <span>Select Files</span>
                        </button>

                        <input
                          ref={fileInputRef}
                          type="file"
                          multiple
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleFilesChosen(e.target.files, "managePhotos")}
                        />
                      </div>
                    </div>

                    {/* Upload Progress Queue (if active) */}
                    {uploadQueue.length > 0 && (
                      <div className="space-y-2 pt-3 border-t border-gray-200/80">
                        <div className="flex items-center justify-between text-xs font-medium text-gray-500">
                          <span>Upload Queue ({uploadQueue.length} files)</span>
                          {uploadQueue.some((it) => it.status === "failed") && (
                            <button
                              type="button"
                              onClick={() => handleRetryFailedUploads("managePhotos")}
                              className="text-[11px] font-bold text-rose-600 hover:underline flex items-center gap-1"
                            >
                              <RefreshCw size={11} />
                              <span>Retry Failed Items</span>
                            </button>
                          )}
                        </div>

                        <div className="max-h-40 overflow-y-auto space-y-2">
                          {uploadQueue.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-center gap-3 p-2 bg-white rounded-xl border border-gray-200 text-xs"
                            >
                              <img
                                src={item.preview}
                                alt=""
                                className="w-8 h-8 rounded-lg object-cover shrink-0"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="font-medium truncate text-gray-900">
                                    {item.name}
                                  </span>
                                  <span className="text-[10px] text-gray-400 font-mono">
                                    {item.status === "complete"
                                      ? "Upload complete"
                                      : item.status === "optimizing"
                                      ? "Optimizing image..."
                                      : item.status === "failed"
                                      ? "Failed"
                                      : item.status === "queued"
                                      ? "Waiting..."
                                      : `${item.progress}%`}
                                  </span>
                                </div>
                                <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full transition-all duration-200 ${
                                      item.status === "failed"
                                        ? "bg-rose-500"
                                        : item.status === "complete"
                                        ? "bg-emerald-500"
                                        : "bg-black"
                                    }`}
                                    style={{ width: `${item.progress}%` }}
                                  />
                                </div>
                                {item.error && (
                                  <p className="text-[10px] text-rose-500 mt-0.5 truncate">
                                    {item.error}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Album Photos List & Reorder */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-xs font-semibold text-gray-900 uppercase tracking-wider">
                        Current Album Photos ({activeAlbumForPhotos.photos?.length || 0})
                      </h4>
                      <span className="text-[11px] text-gray-500">
                        Use ← / → arrows to reorder • Star to set cover
                      </span>
                    </div>

                    {activeAlbumForPhotos.photos && activeAlbumForPhotos.photos.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {activeAlbumForPhotos.photos.map((photo, index) => {
                          const isCover =
                            activeAlbumForPhotos.coverImage === photo.url;

                          return (
                            <div
                              key={photo.id}
                              className={`relative rounded-2xl overflow-hidden border bg-gray-50 transition-all flex flex-col group ${
                                isCover
                                  ? "border-black ring-2 ring-black/10"
                                  : "border-gray-200"
                              }`}
                            >
                              {/* Photo Aspect Preview */}
                              <div className="relative aspect-[4/5] bg-black/5 overflow-hidden">
                                <img
                                  src={photo.url}
                                  alt=""
                                  className="w-full h-full object-cover"
                                />

                                {/* Order Badge */}
                                <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/60 text-white text-[10px] font-mono">
                                  #{index + 1}
                                </div>

                                {/* Cover Badge */}
                                {isCover && (
                                  <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-black text-white text-[10px] font-bold tracking-wider uppercase flex items-center gap-1 shadow-sm">
                                    <Star size={10} className="fill-white" />
                                    <span>Cover</span>
                                  </div>
                                )}
                              </div>

                              {/* Card Control Toolbar */}
                              <div className="p-2.5 bg-white border-t border-gray-100 flex items-center justify-between gap-1 text-xs">
                                {/* Reorder Buttons */}
                                <div className="flex items-center gap-0.5">
                                  <button
                                    type="button"
                                    disabled={index === 0}
                                    onClick={() => handleMovePhoto(index, -1)}
                                    className="p-1 rounded-md hover:bg-gray-100 text-gray-500 hover:text-gray-900 disabled:opacity-25"
                                    title="Move Left / Earlier"
                                  >
                                    <MoveLeft size={13} />
                                  </button>
                                  <button
                                    type="button"
                                    disabled={index === activeAlbumForPhotos.photos.length - 1}
                                    onClick={() => handleMovePhoto(index, 1)}
                                    className="p-1 rounded-md hover:bg-gray-100 text-gray-500 hover:text-gray-900 disabled:opacity-25"
                                    title="Move Right / Later"
                                  >
                                    <MoveRight size={13} />
                                  </button>
                                </div>

                                {/* Cover and Delete */}
                                <div className="flex items-center gap-1">
                                  {!isCover && (
                                    <button
                                      type="button"
                                      onClick={() => handleSetCover(photo.url)}
                                      className="px-2 py-1 rounded-lg text-[10px] font-semibold text-gray-700 hover:bg-gray-100 border border-gray-200"
                                      title="Set as Album Cover"
                                    >
                                      Set Cover
                                    </button>
                                  )}

                                  <button
                                    type="button"
                                    onClick={() => handleRemovePhoto(photo.id)}
                                    className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg"
                                    title="Delete Photograph"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="py-12 text-center bg-gray-50 rounded-2xl border border-gray-200">
                        <Camera size={32} className="mx-auto text-gray-400 mb-2 opacity-60" />
                        <p className="text-xs font-semibold text-gray-900">
                          No photos in this album yet
                        </p>
                        <p className="text-[11px] text-gray-500 mt-0.5">
                          Select files above or pick photos from the Media Library.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="pt-4 mt-6 border-t border-gray-100 flex items-center justify-between shrink-0">
                  <span className="text-xs text-gray-500">
                    Changes to photo order and uploads are saved in real-time.
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setManagePhotosModalOpen(false);
                      refetchAlbums();
                    }}
                    className="px-6 py-2.5 rounded-xl bg-black text-white text-xs font-medium hover:bg-gray-800 transition-colors shadow-xs"
                  >
                    Done
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* =========================================================================
          MODAL 3: MEDIA LIBRARY PICKER (PRESERVE EXISTING CONTENT REQUIREMENT)
      ========================================================================= */}
      {createPortal(
        <AnimatePresence>
          {mediaLibraryModalOpen && (
            <div className="admin-portal fixed inset-0 z-[99995] flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm overflow-hidden">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-2xl p-6 sm:p-8 max-w-3xl w-full border border-gray-200 shadow-xl relative max-h-[calc(100dvh-24px)] sm:max-h-[calc(100dvh-48px)] flex flex-col overflow-hidden"
              >
                <button
                  onClick={() => setMediaLibraryModalOpen(false)}
                  className="absolute top-6 right-6 p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
                >
                  <X size={18} />
                </button>

                <div className="mb-4 shrink-0">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-gray-100 text-gray-700 border border-gray-200">
                    Media Library
                  </span>
                  <h3 className="font-display text-xl text-gray-900 font-semibold mt-1.5">
                    {mediaPickerMode === "cover"
                      ? "Choose Cover Image from Studio Photos"
                      : `Pick Photos to Add (${selectedMediaUrls.length} selected)`}
                  </h3>
                  <p className="text-xs text-gray-500">
                    Select from existing studio photographs without re-uploading duplicate assets.
                  </p>
                </div>

                {/* Grid of Studio Photos */}
                <div className="flex-1 min-h-0 overflow-y-auto py-2">
                  {loadingMediaLibrary ? (
                    <div className="py-20 text-center">
                      <div className="w-8 h-8 rounded-full border-2 border-black border-t-transparent animate-spin mx-auto mb-2" />
                      <p className="text-xs text-gray-500">Loading Media Library...</p>
                    </div>
                  ) : mediaLibraryItems.length > 0 ? (
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                      {mediaLibraryItems.map((item) => {
                        const isSelected = selectedMediaUrls.includes(item.url);

                        return (
                          <div
                            key={item.id}
                            onClick={() => handleSelectMediaItem(item.url)}
                            className={`relative aspect-square rounded-xl overflow-hidden border cursor-pointer transition-all ${
                              isSelected
                                ? "border-black ring-2 ring-black/10 scale-[0.98]"
                                : "border-gray-200 hover:border-gray-400"
                            }`}
                          >
                            <img
                              src={item.url}
                              alt={item.title}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/20 hover:bg-black/10 transition-colors" />

                            {/* Category Tag */}
                            <div className="absolute bottom-1 left-1 right-1">
                              <span className="block truncate text-[9px] uppercase font-bold text-white bg-black/60 px-1 py-0.5 rounded">
                                {item.category}
                              </span>
                            </div>

                            {/* Checkmark for multi-select */}
                            {isSelected && (
                              <div className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black text-white shadow-xs">
                                <Check size={12} />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="py-16 text-center text-xs text-gray-500">
                      No legacy studio photos found in media library.
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="pt-4 border-t border-gray-100 flex items-center justify-between shrink-0">
                  <span className="text-xs text-gray-500">
                    {mediaPickerMode === "cover"
                      ? "Click any photograph to set as album cover."
                      : `${selectedMediaUrls.length} photos selected.`}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setMediaLibraryModalOpen(false)}
                      className="px-4 py-2 rounded-xl border border-gray-200 bg-white text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-xs"
                    >
                      Cancel
                    </button>
                    {mediaPickerMode === "photos" && (
                      <button
                        type="button"
                        disabled={selectedMediaUrls.length === 0}
                        onClick={handleConfirmMediaPhotos}
                        className="px-5 py-2 rounded-xl bg-black text-white text-xs font-medium hover:bg-gray-800 transition-colors disabled:opacity-40 shadow-xs"
                      >
                        Add Selected ({selectedMediaUrls.length})
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* =========================================================================
          MODAL 4: CONFIRM DELETE ALBUM
      ========================================================================= */}
      <ConfirmModal
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title={`Delete Album "${albumToDelete?.title || ""}"`}
        message="Are you sure you want to permanently delete this event album? Its photographs will be unassigned from this album. Existing media library assets will be preserved."
        confirmText="Delete Album"
        isDanger={true}
      />

      {/* =========================================================================
          CATEGORY MODALS (MANAGED CATEGORIES)
      ========================================================================= */}
      <AddCategoryModal
        isOpen={addCategoryModalOpen}
        onClose={() => setAddCategoryModalOpen(false)}
        title="Add Gallery Category"
        existingCategories={activeCategoryNames}
        onAdd={async (catName) => {
          await addGalleryCategory(catName);
          addToast({ type: "success", message: `Added category "${catName}".` });
          setFormData((prev) => ({ ...prev, category: catName }));
        }}
      />

      <ManageCategoriesModal
        isOpen={manageCategoriesModalOpen}
        onClose={() => setManageCategoriesModalOpen(false)}
        title="Manage Gallery Categories"
        categories={galleryCategories}
        onAdd={async (catName) => {
          await addGalleryCategory(catName);
          addToast({ type: "success", message: `Added category "${catName}".` });
        }}
        onToggleStatus={async (catId) => {
          await toggleGalleryCategoryStatus(catId);
          addToast({ type: "success", message: "Category status updated." });
        }}
      />
    </div>
  );
}
