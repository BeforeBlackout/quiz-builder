import { expect, test } from "@playwright/test";

test("creates a quiz, opens it from the list, deletes it and it stays gone after reload", async ({
  page,
}) => {
  const title = `E2E quiz ${Date.now()}`;
  const prompt = "Is the sky blue?";

  await page.goto("/create");
  await page.getByPlaceholder("Give your quiz a clear, memorable name").fill(title);
  await page.getByPlaceholder("Write your question").fill(prompt);
  await page.getByRole("button", { name: "Create quiz" }).click();

  await expect(page).toHaveURL(/\/quizzes\/\d+$/);
  await expect(page.getByRole("heading", { level: 1, name: title })).toBeVisible();

  await page.getByRole("link", { name: "Back to my quizzes" }).click();
  await expect(page).toHaveURL(/\/quizzes$/);

  const quizLink = page.getByRole("link", { name: title });
  await quizLink.click();
  await expect(page).toHaveURL(/\/quizzes\/\d+$/);
  await expect(page.getByRole("heading", { level: 1, name: title })).toBeVisible();
  await expect(page.getByText(prompt)).toBeVisible();

  await page.getByRole("link", { name: "Back to my quizzes" }).click();
  await page.getByRole("button", { name: `Delete ${title}` }).click();
  const dialog = page.getByRole("dialog", { name: "Delete this quiz?" });
  await dialog.getByRole("button", { name: "Delete quiz" }).click();
  await expect(dialog).toBeHidden();
  await expect(quizLink).toBeHidden();

  await page.reload();
  await expect(page.getByRole("heading", { level: 1, name: "My quizzes" })).toBeVisible();
  await expect(quizLink).toHaveCount(0);
});
