import { api } from "@/lib/api";
import ContentList from "@/components/content-list";

export default function VoicesPage() {
  return (
    <ContentList
      type="voices"
      title="Voices"
      getItems={(status) => api.getVoices(status)}
      getTitle={(item) => item.name as string}
      getCategory={(item) => item.sector as string}
      editPath={(id) => `/voices/${id}/edit`}
    />
  );
}
