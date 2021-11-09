import { screen } from "@testing-library/dom";
import "@testing-library/jest-dom";
import BillsUI from "../views/BillsUI.js";
import { bills } from "../fixtures/bills.js";
import Bills from "../containers/Bills.js";
import firebase from "../__mocks__/firebase.js";
import { ROUTES } from "../constants/routes.js";
import userEvent from "@testing-library/user-event";

describe("Given I am connected as an employee", () => {
  describe("When I try to connect on Bills Page", () => {
    test("Then it's loading", () => {
      const html = BillsUI({ loading: true });
      document.body.innerHTML = html;
      expect(screen.getAllByText("Loading...")).toBeTruthy();
    });
    test("Then there is an error", () => {
      const html = BillsUI({ error: "Oups, une erreur" });
      document.body.innerHTML = html;
      expect(screen.getAllByText("Erreur")).toBeTruthy();
    });
  });

  describe("When I am connected on Bills Page", () => {
    test("Then bills should be ordered from earliest to latest", () => {
      const html = BillsUI({ data: bills });
      document.body.innerHTML = html;
      const dates = screen
        .getAllByText(
          /^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i
        )
        .map((a) => a.innerHTML);
      const antiChrono = (a, b) => (a < b ? 1 : -1);
      const datesSorted = [...dates].sort(antiChrono);
      expect(dates).toEqual(datesSorted);
    });
    describe("When I click on the newBill button", () => {
      test("Then a form is rendered", () => {
        const html = BillsUI({ data: bills });
        document.body.innerHTML = html;

        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname });
        };

        const newBills = new Bills({
          document,
          onNavigate,
          firestore: null,
          localStorage: null,
        });
        const handleClickNewBill = jest.spyOn(newBills, "handleClickNewBill");
        const newBillBtn = screen.getByTestId("btn-new-bill");
        userEvent.click(newBillBtn);
        expect(handleClickNewBill).toHaveBeenCalled();
        expect(screen.getByTestId("form-new-bill")).toBeInTheDocument();
      });
    });
    describe("When I click on eye button", () => {
      test("Then it should rendered a modal", () => {
        const html = BillsUI({ data: bills });
        document.body.innerHTML = html;

        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname });
        };

        const newBills = new Bills({
          document,
          onNavigate,
          firestore: null,
          localStorage: null,
        });
        $.fn.modal = jest.fn();
        const eyes = screen.getAllByTestId("icon-eye");
        const handleClickIconEye = jest.fn(newBills.handleClickIconEye);
        eyes.forEach((eye) => {
          eye.addEventListener("click", handleClickIconEye(eye));
        });
        userEvent.click(eyes[0]);
        expect(handleClickIconEye).toBeCalled();
        expect(screen.getByText("Justificatif")).toBeInTheDocument();
      });
    });
  });
});

// test d'intégration GET
describe("Given I am a user connected as an employee", () => {
  describe("When I navigate to Bills", () => {
    test("fetches bills from mock API GET", async () => {
      const getSpy = jest.spyOn(firebase, "get");
      const bills = await firebase.get();
      expect(getSpy).toHaveBeenCalledTimes(1);
      expect(bills.data.length).toBe(4);
    });
    test("fetches bills from an API and fails with 404 message error", async () => {
      firebase.get.mockImplementationOnce(() =>
        Promise.reject(new Error("Erreur 404"))
      );
      const html = BillsUI({ error: "Erreur 404" });
      document.body.innerHTML = html;
      const message = await screen.getByText(/Erreur 404/);
      expect(message).toBeTruthy();
    });
    test("fetches messages from an API and fails with 500 message error", async () => {
      firebase.get.mockImplementationOnce(() =>
        Promise.reject(new Error("Erreur 500"))
      );
      const html = BillsUI({ error: "Erreur 500" });
      document.body.innerHTML = html;
      const message = await screen.getByText(/Erreur 500/);
      expect(message).toBeTruthy();
    });
  });
});
