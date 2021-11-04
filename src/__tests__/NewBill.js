import { getByTestId, screen } from "@testing-library/dom";
import "@testing-library/jest-dom";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import { ROUTES } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import firebase from "../__mocks__/firebase.js";
import BillsUI from "../views/BillsUI.js";

describe("Given I am connected as an employee", () => {
  beforeAll(() => {
    const dom = NewBillUI();
    document.body.innerHTML = dom;

    const onNavigate = (pathname) => {
      document.body.innerHTML = ROUTES({ pathname });
    };
  });

  describe("When I go to the NewBill page ", () => {
    test("Then the newBill page should rendered ", () => {
      expect(screen.getAllByText("Envoyer une note de frais")).toBeTruthy();

      expect(screen.getByTestId("form-new-bill").toBeTruthy());
    });
  });

  describe("When I am on NewBill Page", () => {
    describe("when I upload an image", () => {
      test("Then if it's not an image, it should display an error message", () => {});
    });
  });

  // test d'intégration POST
  describe("When I post a new bill", () => {
    test("then a new bill is created", () => {});
  });
});
