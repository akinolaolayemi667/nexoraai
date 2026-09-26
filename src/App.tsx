import { Suspense, lazy } from "react";
import {
  Outlet,
  RouterProvider,
  ScrollRestoration,
  createBrowserRouter,
  type RouteObject,
} from "react-router";
import { RequireAuth } from "@/components/auth/auth-provider";
import { CrmProvider } from "@/components/crm/crm-provider";
import { AppLayout } from "@/components/layout/app-layout";
import { AuthLayout } from "@/components/layout/auth-layout";
import { MarketingLayout } from "@/components/layout/marketing-layout";
import { PageLoader } from "@/components/ui";
import NotFoundPage from "@/pages/not-found";
import RouteErrorPage from "@/pages/route-error";

const HomePage = lazy(() => import("@/pages/marketing/home"));
const FeaturesPage = lazy(() => import("@/pages/marketing/features"));
const PricingPage = lazy(() => import("@/pages/marketing/pricing"));
const LoginPage = lazy(() => import("@/pages/auth/login"));
const SignupPage = lazy(() => import("@/pages/auth/signup"));
const DashboardPage = lazy(() => import("@/pages/app/dashboard"));
const LeadsPage = lazy(() => import("@/pages/app/leads"));
const ContactsPage = lazy(() => import("@/pages/app/contacts"));
const ContactProfilePage = lazy(() => import("@/pages/app/contact-profile"));
const PipelinePage = lazy(() => import("@/pages/app/pipeline"));
const ConversationsPage = lazy(() => import("@/pages/app/conversations"));
const TasksPage = lazy(() => import("@/pages/app/tasks"));
const AutomationsPage = lazy(() => import("@/pages/app/automations"));
const AutomationBuilderPage = lazy(() => import("@/pages/app/automation-builder"));
const AiAssistantPage = lazy(() => import("@/pages/app/ai-assistant"));
const AnalyticsPage = lazy(() => import("@/pages/app/analytics"));
const IntegrationsPage = lazy(() => import("@/pages/app/integrations"));
const TeamPage = lazy(() => import("@/pages/app/team"));
const SettingsPage = lazy(() => import("@/pages/app/settings"));
const BillingPage = lazy(() => import("@/pages/app/billing"));

function RootLayout() {
  return (
    <>
      <ScrollRestoration />
      <Outlet />
    </>
  );
}

function getDevRoutes(): RouteObject[] {
  if (!import.meta.env.DEV) return [];
  const UiGalleryPage = lazy(() => import("@/pages/dev/ui-gallery"));
  return [
    {
      path: "ui",
      element: (
        <Suspense fallback={<PageLoader />}>
          <UiGalleryPage />
        </Suspense>
      ),
    },
  ];
}

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    errorElement: <RouteErrorPage />,
    children: [
      {
        element: <MarketingLayout />,
        children: [
          { index: true, element: <HomePage /> },
          { path: "features", element: <FeaturesPage /> },
          { path: "pricing", element: <PricingPage /> },
        ],
      },
      {
        element: <AuthLayout />,
        children: [
          { path: "login", element: <LoginPage /> },
          { path: "signup", element: <SignupPage /> },
        ],
      },
      {
        path: "app",
        element: (
          <RequireAuth>
            <CrmProvider>
              <AppLayout />
            </CrmProvider>
          </RequireAuth>
        ),
        children: [
          { index: true, element: <DashboardPage /> },
          { path: "leads", element: <LeadsPage /> },
          { path: "leads/:leadId", element: <ContactProfilePage /> },
          { path: "contacts", element: <ContactsPage /> },
          { path: "contacts/:leadId", element: <ContactProfilePage /> },
          { path: "pipeline", element: <PipelinePage /> },
          { path: "conversations", element: <ConversationsPage /> },
          { path: "tasks", element: <TasksPage /> },
          { path: "automations", element: <AutomationsPage /> },
          { path: "automations/:workflowId", element: <AutomationBuilderPage /> },
          { path: "ai", element: <AiAssistantPage /> },
          { path: "analytics", element: <AnalyticsPage /> },
          { path: "integrations", element: <IntegrationsPage /> },
          { path: "team", element: <TeamPage /> },
          { path: "settings", element: <SettingsPage /> },
          { path: "billing", element: <BillingPage /> },
        ],
      },
      ...getDevRoutes(),
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
