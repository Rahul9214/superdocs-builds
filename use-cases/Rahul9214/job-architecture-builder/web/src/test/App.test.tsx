import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { App } from "../App";
import { installApiMock } from "./mockApi";

function renderApp(path = "/") {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
}

async function ready() {
  return screen.findByRole("combobox", { name: /organization/i });
}

describe("reviewer application", () => {
  beforeEach(() => {
    installApiMock();
  });

  it("renders primary navigation", async () => {
    renderApp("/");
    await ready();
    const nav = screen.getByRole("navigation", { name: "Primary" });
    for (const label of [
      "Overview",
      "Sources",
      "Architecture",
      "Exceptions",
      "Framework",
      "Profiles",
      "Change Impact",
      "Review",
      "Export",
    ]) {
      expect(within(nav).getByRole("link", { name: label })).toBeInTheDocument();
    }
  });

  it("switches corpus to Meridian HealthTech", async () => {
    const user = userEvent.setup();
    renderApp("/sources");
    await ready();
    await user.selectOptions(screen.getByRole("combobox", { name: /organization/i }), "corpus-b");
    expect(screen.getByRole("combobox", { name: /organization/i })).toHaveValue("corpus-b");
    expect(await screen.findByText("Clinical Operations Analyst")).toBeInTheDocument();
  });

  it("shows architecture metrics, title-conflict evidence, and the role drawer", async () => {
    const user = userEvent.setup();
    renderApp("/architecture");
    expect(await screen.findByText("total roles")).toBeInTheDocument();
    expect(screen.getByText("21")).toBeInTheDocument();
    expect(screen.getByText("Senior Software Engineer, Workplace Tools")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Title vs evidence" })).toBeInTheDocument();
    expect(screen.getByText(/Title signal/)).toBeInTheDocument();
    expect(screen.getByText(/Evidence-based outcome/)).toBeInTheDocument();
    expect(screen.getByText(/Why it differs/)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Open evidence" }));
    const drawer = await screen.findByRole("dialog", { name: "Senior Software Engineer, Workplace Tools" });
    expect(within(drawer).getByText(/title was not used to classify/i)).toBeInTheDocument();
    expect(within(drawer).getByText(/Works from defined tickets/)).toBeInTheDocument();
  });

  it("renders provisional and misfit findings as architecture results", async () => {
    renderApp("/exceptions");
    expect(await screen.findByRole("heading", { name: "Provisional and misfit review" })).toBeInTheDocument();
    expect(screen.getByText(/Misfits are valid architecture findings/)).toBeInTheDocument();
    expect(screen.getByText(/Facilities operations sit outside/)).toBeInTheDocument();
    expect(screen.getByText(/requires architecture decision/)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /auto assign/i })).not.toBeInTheDocument();
  });

  it("renders the framework level comparison table", async () => {
    renderApp("/framework");
    expect(await screen.findByRole("heading", { name: "Framework" })).toBeInTheDocument();
    expect(screen.getByText("Individual contributor levels")).toBeInTheDocument();
    expect(screen.getAllByRole("columnheader", { name: "Scope" }).length).toBe(2);
    expect(screen.getByText("IC4 v1")).toBeInTheDocument();
    expect(screen.getByText("Cross-team domain")).toBeInTheDocument();
    expect(screen.getByText("M1 v1")).toBeInTheDocument();
  });

  it("renders an IC4 profile", async () => {
    const user = userEvent.setup();
    renderApp("/profiles");
    expect(await screen.findByText("Software Engineer II, Payments")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Open profile" }));
    expect(await screen.findByText("Owns payment sequencing.")).toBeInTheDocument();
    expect(screen.getByText(/Scope: Cross-team domain/)).toBeInTheDocument();
  });

  it("surfaces an invalid level edit", async () => {
    const user = userEvent.setup();
    renderApp("/impact");
    await screen.findByRole("heading", { name: "Change impact" });
    await user.click(screen.getByRole("button", { name: "Analyze impact" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(/non-empty strings/i);
  });

  it("plans a targeted IC4 scope change", async () => {
    const user = userEvent.setup();
    renderApp("/impact");
    expect(await screen.findByRole("heading", { name: "Change impact" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "OLD" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "NEW" })).toBeInTheDocument();
    await user.type(screen.getByLabelText(/proposed value/i), "Cross-team domain plus sequencing veto.");
    await user.click(screen.getByRole("button", { name: "Plan targeted updates" }));
    expect(await screen.findByText("affected profiles")).toBeInTheDocument();
    expect(screen.getByText("Unrelated sections preserved. Only listed fields change.")).toBeInTheDocument();
    expect(screen.getByText("Scope: Cross-team domain plus sequencing veto.")).toBeInTheDocument();
  });

  it("shows before/after review cards and records approve or reject", async () => {
    const user = userEvent.setup();
    renderApp("/review");
    expect(await screen.findByText("Before")).toBeInTheDocument();
    expect(screen.getByText("After")).toBeInTheDocument();
    expect(screen.getByText("remote operation")).toBeInTheDocument();
    expect(screen.getByText("review outcome")).toBeInTheDocument();
    expect(screen.getByText("mutation applied")).toBeInTheDocument();
    expect(screen.getByText("domain applied")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Approve" }));
    expect(await screen.findByText(/Decision: approved/)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Reject" }));
    expect(await screen.findByText(/Decision: rejected/)).toBeInTheDocument();
  });

  it("shows SuperDocs as not configured on Export", async () => {
    renderApp("/export");
    expect(await screen.findByText("not configured")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /live superdocs export unavailable/i })).toBeDisabled();
    expect(screen.getByText(/SUPERDOCS_API_KEY is not configured/)).toBeInTheDocument();
  });
});

describe("empty and error states", () => {
  it("shows an empty review state", async () => {
    installApiMock({ reviewEmpty: true });
    renderApp("/review");
    expect(await screen.findByText(/No pending review/)).toBeInTheDocument();
  });

  it("shows an architecture API error", async () => {
    installApiMock({ failArchitecture: true });
    renderApp("/architecture");
    expect(await screen.findByRole("alert")).toHaveTextContent("Architecture service unavailable.");
  });
});
