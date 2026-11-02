import { notFound } from "next/navigation";
import StabilityLab from "./StabilityLab";

/** Dev-only: re-scans test faces several ways and reports how often the face shape changes. */
export default function Page() {
  if (process.env.NODE_ENV === "production") notFound();
  return <StabilityLab />;
}
