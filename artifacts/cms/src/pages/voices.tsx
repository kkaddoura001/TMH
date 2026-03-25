import { api } from "@/lib/api";
import ContentList from "@/components/content-list";

export default function VoicesPage() {
  return (
    <ContentList
      type="voices"
      title="Voices"
      getItems={(status) => api.getVoices(status)}
      getTitle={(item) => item.name}
      getCategory={(item) => item.sector}
      editPath={(id) => `/voices/${id}/edit`}
    />
  );
}
