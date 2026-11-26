import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Button from "@/components/ui/Button";
import DataTable from "@/components/ui/DataTable";
import FormInput from "@/components/ui/FormInput";
import Select from "@/components/ui/Select";

describe("Button", () => {
  it("is disabled while loading", () => {
    render(<Button loading>Save</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
    expect(screen.getByRole("status")).toBeInTheDocument();
  });
});

describe("FormInput", () => {
  it("calls onChange with name and value and shows errors accessibly", async () => {
    const onChange = vi.fn();
    render(
      <FormInput name="teamName" label="Team name" value="" onChange={onChange} error="Required" />,
    );

    await userEvent.type(screen.getByLabelText("Team name"), "A");

    expect(onChange).toHaveBeenCalledWith("teamName", "A");
    expect(screen.getByLabelText("Team name")).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByText("Required")).toBeInTheDocument();
  });
});

describe("Select", () => {
  it("selects an option with the keyboard", async () => {
    const onChange = vi.fn();
    const options = [
      { label: "Defender", value: 2 },
      { label: "Striker", value: 4 },
    ];
    render(
      <Select
        name="positionId"
        label="Position"
        options={options}
        value={null}
        onChange={onChange}
      />,
    );

    screen.getByRole("combobox").focus();
    await userEvent.keyboard("{ArrowDown}{ArrowDown}{Enter}");

    expect(onChange).toHaveBeenCalledWith("positionId", 4);
  });
});

describe("DataTable", () => {
  const columns = [
    { accessorKey: "teamName", header: "Team" },
    { accessorKey: "points", header: "Points" },
  ];
  const state = { pagination: { pageIndex: 0, pageSize: 10 }, sorting: [] };

  it("renders rows and asks the parent to sort on header click", async () => {
    const onSortingChange = vi.fn();
    render(
      <DataTable
        columns={columns}
        data={[{ teamName: "Shirdi United", points: 9 }]}
        total={1}
        state={state}
        onSortingChange={onSortingChange}
        onPaginationChange={vi.fn()}
      />,
    );

    expect(screen.getByText("Shirdi United")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /points/i }));
    expect(onSortingChange).toHaveBeenCalled();
  });

  it("shows the empty state when there are no rows", () => {
    render(<DataTable columns={columns} data={[]} total={0} state={state} />);
    expect(screen.getByText("Nothing here yet")).toBeInTheDocument();
  });
});
