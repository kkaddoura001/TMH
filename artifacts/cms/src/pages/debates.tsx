import { api } from "@/lib/api";
import ContentList from "@/components/content-list";

export default function DebatesPage() {
  return (
    <ContentList
      type="debates"
      title="Debates"
      getItems={(status) => api.getDebates(status)}
      getTitle={(item) => item.question as string}
      getCategory={(item) => item.category as string}
      editPath={(id) => `/debates/${id}/edit`}
    />
  );
}
