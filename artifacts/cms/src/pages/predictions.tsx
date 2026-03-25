import { api } from "@/lib/api";
import ContentList from "@/components/content-list";

export default function PredictionsPage() {
  return (
    <ContentList
      type="predictions"
      title="Predictions"
      getItems={(status) => api.getPredictions(status)}
      getTitle={(item) => item.question}
      getCategory={(item) => item.category}
      editPath={(id) => `/predictions/${id}/edit`}
    />
  );
}
