import { render, screen } from "@testing-library/react";
import { usePathname } from "next/navigation";

import { Layout } from "@/components/Layout";

jest.mock("next/navigation", () => ({
  usePathname: jest.fn(),
}));

const usePathnameMock = jest.mocked(usePathname);

describe("Layout", () => {
  it("renders the brand link and page content", () => {
    usePathnameMock.mockReturnValue("/create");
    render(
      <Layout>
        <p>Page body</p>
      </Layout>,
    );

    expect(screen.getByRole("link", { name: /quiz-builder/ })).toHaveAttribute("href", "/quizzes");
    expect(screen.getByRole("main")).toHaveTextContent("Page body");
  });

  it("highlights My quizzes on /quizzes", () => {
    usePathnameMock.mockReturnValue("/quizzes");
    render(<Layout>content</Layout>);

    const link = screen.getByRole("link", { name: "My quizzes" });
    expect(link).toHaveClass("text-accent");
    expect(link.querySelector("img")).toHaveAttribute("src", "/icons/grid-active.svg");
  });

  it.each(["/quizzes/12", "/create", "/quizzes-archive"])(
    "does not highlight My quizzes on %s",
    (pathname) => {
      usePathnameMock.mockReturnValue(pathname);
      render(<Layout>content</Layout>);

      const link = screen.getByRole("link", { name: "My quizzes" });
      expect(link).not.toHaveClass("text-accent");
      expect(link.querySelector("img")).toHaveAttribute("src", "/icons/grid.svg");
    },
  );
});
