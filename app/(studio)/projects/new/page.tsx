import { Suspense } from "react";
import { NewProjectForm } from "./NewProjectForm";

export default function NewProjectPage(): React.ReactElement {
  return (
    <Suspense fallback={<div className="p-6 text-zinc-500">Chargement...</div>}>
      <NewProjectForm />
    </Suspense>
  );
}
