
// Nova entrada de rota para a página pública de presença da célula
import CellAttendancePage from "../pages/CellAttendancePage";

export const cellRoutes = [
  {
    path: "/cells/:cellId/attendance",
    element: <CellAttendancePage />,
  },
];
