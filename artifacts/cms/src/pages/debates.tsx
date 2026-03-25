import { api } from "@/lib/api";
import ContentList from "@/components/content-list";

export default function DebatesPage() {
  return (
    <ContentList
      type="debates"
      title="Debates"
      getItems={(status) => api.getDebates(status)}
      getTitle={(item) => item.question}
      getCategory={(item) => item.category}
      editPath={(id) => `/debates/${id}/edit`}
    />
  );
}
