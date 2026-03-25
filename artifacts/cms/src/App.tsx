import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "@/lib/auth";
import Layout from "@/components/layout";
import LoginPage from "@/pages/login";
import DashboardPage from "@/pages/dashboard";
import DebatesPage from "@/pages/debates";
import PredictionsPage from "@/pages/predictions";
import VoicesPage from "@/pages/voices";
import EditDebatePage from "@/pages/edit-debate";
import EditPredictionPage from "@/pages/edit-prediction";
import EditVoicePage from "@/pages/edit-voice";
import HomepagePage from "@/pages/homepage";

const queryClient = new QueryClient();

function ProtectedRoutes() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) return <LoginPage />;

  return (
    <Layout>
      <Switch>
        <Route path="/dashboard" component={DashboardPage} />
        <Route path="/homepage" component={HomepagePage} />
        <Route path="/debates" component={DebatesPage} />
        <Route path="/debates/:id/edit" component={EditDebatePage} />
        <Route path="/predictions" component={PredictionsPage} />
        <Route path="/predictions/:id/edit" component={EditPredictionPage} />
        <Route path="/voices" component={VoicesPage} />
        <Route path="/voices/:id/edit" component={EditVoicePage} />
        <Route path="/">
          <Redirect to="/dashboard" />
        </Route>
        <Route>
          <Redirect to="/dashboard" />
        </Route>
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
        <AuthProvider>
          <ProtectedRoutes />
        </AuthProvider>
      </WouterRouter>
    </QueryClientProvider>
  );
}

export default App;
