import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { WithAuth } from "@/components/global/authorization/withPermissions";
import { permissionsListQuery } from "@/features/permissions/queries";
import { getQueryClient } from "@/lib/react-query/server-query-client";
import { ExamplesClient } from "./examples-client";

/**
 * Server Component for Examples page
 * Following fetching-rules.md - Rule 2: Server Component Must Prefetch Query
 *
 * Flow:
 * 1. Server prefetches query data
 * 2. Data is dehydrated to client
 * 3. Client component uses useQuery with same query key (no double fetch)
 */
async function ExamplesPage() {
  const queryClient = getQueryClient();

  // Rule 2: Server prefetch query
  await queryClient.prefetchQuery(permissionsListQuery());

  return (
    // Rule 1: Hydrate data from server to client
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ExamplesClient />
    </HydrationBoundary>
  );
}

// Rule from protected-route-pattern.md: Protect page with server-side HOC
export default WithAuth(ExamplesPage, { permission: "permission.view" });
