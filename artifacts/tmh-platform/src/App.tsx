import { Switch, Route, Router as WouterRouter } from "wouter"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { Toaster } from "@/components/ui/toaster"
import { TooltipProvider } from "@/components/ui/tooltip"

import Home from "@/pages/home"
import Polls from "@/pages/polls"
import PollDetail from "@/pages/poll-detail"
import PollArchive from "@/pages/poll-archive"
import Profiles from "@/pages/profiles"
import ProfileDetail from "@/pages/profile-detail"
import Rankings from "@/pages/rankings"
import WeeklyPulse from "@/pages/weekly-pulse"
import Predictions from "@/pages/predictions"
import SentimentMap from "@/pages/sentiment-map"
import About from "@/pages/about"
import Apply from "@/pages/apply"
import Join from "@/pages/join"
import Terms from "@/pages/terms"
import FAQ from "@/pages/faq"
import Admin from "@/pages/admin"
import NotFound from "@/pages/not-found"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/polls" component={Polls} />
      <Route path="/polls/archive" component={PollArchive} />
      <Route path="/polls/:id" component={PollDetail} />
      <Route path="/profiles" component={Profiles} />
      <Route path="/profiles/:id" component={ProfileDetail} />
      <Route path="/rankings" component={Rankings} />
      <Route path="/weekly-pulse" component={WeeklyPulse} />
      <Route path="/predictions" component={Predictions} />
      <Route path="/sentiment-map" component={SentimentMap} />
      <Route path="/about" component={About} />
      <Route path="/apply" component={Apply} />
      <Route path="/join" component={Join} />
      <Route path="/terms" component={Terms} />
      <Route path="/faq" component={FAQ} />
      <Route path="/admin" component={Admin} />
      <Route component={NotFound} />
    </Switch>
  )
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  )
}

export default App;
