import { Suspense } from "react";
import FaceScanApp from "@/components/FaceScanApp";

export default function Page() {
  return (
    <Suspense>
      <FaceScanApp />
    </Suspense>
  );
}
