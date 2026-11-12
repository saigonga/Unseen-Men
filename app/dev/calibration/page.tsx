import { notFound } from "next/navigation";
import CalibrationLab from "./CalibrationLab";

export default function Page() {
  if (process.env.NODE_ENV === "production") notFound();
  return <CalibrationLab />;
}
