import { api } from "@/lib/api";
import ContentList from "@/components/content-list";

export default function PredictionsPage() {
  return (
    <ContentList
      type="predictions"
      title="Predictions"
      getItems={(status) => api.getPredictions(status)}
      getTitle={(item) => item.question as string}
      getCategory={(item) => item.category as string}
      editPath={(id) => `/predictions/${id}/edit`}
    />
  );
}
