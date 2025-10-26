import Dashboard from "@/pages/dashboard";

interface StyleLandingPageProps {
  style: string;
}

export default function StyleLandingPage({ style }: StyleLandingPageProps) {
  // For now, just render the dashboard
  // In task 4, we'll add style-specific landing page content
  // The style parameter will be used to pre-select and highlight the specific style
  return <Dashboard />;
}
