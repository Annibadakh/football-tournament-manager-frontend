import { fireEvent, render, screen } from "@testing-library/react";
import StreamPlayer from "@/components/stream/StreamPlayer";
import StreamThumb from "@/components/stream/StreamThumb";
import { STREAM_STATUS } from "@/constants/stream.constants";

const stream = {
  id: "s1",
  title: "Final · Kings v Strikers",
  videoId: "abcdEFGhij1",
  embedUrl: "https://www.youtube-nocookie.com/embed/abcdEFGhij1",
  watchUrl: "https://www.youtube.com/watch?v=abcdEFGhij1",
  thumbnailUrl: "https://i.ytimg.com/vi/abcdEFGhij1/hqdefault.jpg",
  isEmbeddable: true,
  status: STREAM_STATUS.LIVE,
  scheduledAt: null,
  match: null,
};

describe("StreamPlayer", () => {
  it("embeds the privacy-enhanced player and keeps a YouTube link", () => {
    render(<StreamPlayer stream={stream} />);
    const frame = screen.getByTitle(stream.title);
    expect(frame.getAttribute("src")).toMatch(
      /^https:\/\/www\.youtube-nocookie\.com\/embed\/abcdEFGhij1/,
    );
    expect(screen.getByText("Live")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Watch on YouTube/ })).toHaveAttribute(
      "href",
      stream.watchUrl,
    );
  });

  it("falls back to a Watch on YouTube button when embedding is off", () => {
    render(
      <StreamPlayer stream={{ ...stream, isEmbeddable: false, status: STREAM_STATUS.ENDED }} />,
    );
    expect(screen.queryByTitle(stream.title)).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Watch on YouTube/ })).toHaveAttribute(
      "target",
      "_blank",
    );
    expect(screen.getByText("Replay")).toBeInTheDocument();
  });
});

describe("StreamThumb", () => {
  it("selects the stream on click and shows upcoming time", () => {
    const onSelect = vi.fn();
    render(
      <StreamThumb
        stream={{
          ...stream,
          status: STREAM_STATUS.SCHEDULED,
          scheduledAt: "2027-04-10T03:30:00.000Z",
        }}
        onSelect={onSelect}
      />,
    );
    expect(screen.getByText("Upcoming")).toBeInTheDocument();
    expect(screen.getByText(/9:00 am IST/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button"));
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ id: "s1" }));
  });
});
