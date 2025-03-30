import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/budget/$budgetId')({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/budget/$budgetId"!</div>;
}
