import { Helmet } from "react-helmet-async";

interface Props {
  title?: string;
  description?: string;
  siteTitle: string;
}

export default function Meta({ title, description, siteTitle }: Props) {
  const fullTitle = title ? `${siteTitle} | ${title}` : siteTitle;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      
      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://photos.lemiverse.win/" />
      <meta property="og:image" content="https://photos.lemiverse.win/img/og-preview.jpg" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      
      <meta name="theme-color" content="#301934" />
    </Helmet>
  );
}