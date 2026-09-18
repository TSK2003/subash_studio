import { Helmet } from "react-helmet-async";

export default function Seo({ title, description }) {
  return (
    <Helmet>
      <title>{title ? `${title} — SUBASH STUDIO` : "SUBASH STUDIO"}</title>
      {description && <meta name="description" content={description} />}
    </Helmet>
  );
}
