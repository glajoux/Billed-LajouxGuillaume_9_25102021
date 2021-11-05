/**
 * @jest-environment jsdom
 */

import { screen } from "@testing-library/dom";
import "@testing-library/jest-dom";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import { ROUTES } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import userEvent from "@testing-library/user-event";
import firebase from "../__mocks__/firebase.js";

describe("Given I am connected as an employee", () => {
  let newBill;
  beforeAll(() => {
    const dom = NewBillUI();
    document.body.innerHTML = dom;

    const onNavigate = (pathname) => {
      document.body.innerHTML = ROUTES({ pathname });
    };

    Object.defineProperty(window, "localStorage", { value: localStorageMock });
    window.localStorage.setItem(
      "user",
      JSON.stringify({
        type: "Employee",
      })
    );

    newBill = new NewBill({
      document,
      onNavigate,
      firestore: null,
      localStorage: window.localStorage,
    });
  });

  describe("When I go to the NewBill page ", () => {
    test("Then the newBill page should rendered ", () => {
      expect(screen.getAllByText("Envoyer une note de frais")).toBeTruthy();
      const form = screen.getByTestId("form-new-bill");
      expect(form).toBeInTheDocument();
    });
  });

  describe("When I am on NewBill Page", () => {
    describe("when I upload an image", () => {
      test("Then if it's not an image, it should display an error message", () => {
        const testFile = new File(["pdf"], "test.pdf", {
          type: "application/pdf",
        });
        const handleChangeFile = jest.fn(newBill.handleChangeFile);
        const inputFile = screen.getByTestId("file");
        userEvent.upload(inputFile, testFile);
        expect(handleChangeFile).toHaveBeenCalled();
        expect(screen.getByTestId("message-erreur")).toBeVisible();
      });
    });

    test("Then if it's an image, it should create a new bill", () => {});
  });

  // test d'intégration POST
  describe("When I post a new bill", () => {
    test("then a new bill is created", () => {});
  });
});
