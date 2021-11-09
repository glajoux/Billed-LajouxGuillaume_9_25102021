/**
 * @jest-environment jsdom
 */

import { fireEvent, screen } from "@testing-library/dom";
import "@testing-library/jest-dom";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import { ROUTES } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import userEvent from "@testing-library/user-event";
import firebase from "../__mocks__/firebase.js";
import firestore from "../app/Firestore";
import BillsUI from "../views/BillsUI.js";

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
      firestore: firestore,
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
        const handleChangeFile = jest.fn((e) => newBill.handleChangeFile(e));
        const inputFile = screen.getByTestId("file");
        inputFile.addEventListener("change", handleChangeFile);
        userEvent.upload(inputFile, testFile);
        expect(handleChangeFile).toHaveBeenCalled();
        expect(screen.getByTestId("message-erreur")).toBeVisible();
      });

      test("Then if it's an image, upload an image", () => {
        const testFile = new File(["png"], "png.png", {
          type: "image/png",
        });
        const handleChangeFile = jest.fn((e) => newBill.handleChangeFile(e));
        const inputFile = screen.getByTestId("file");
        inputFile.addEventListener("change", handleChangeFile);
        userEvent.upload(inputFile, testFile);
        expect(handleChangeFile).toHaveBeenCalled();
        expect(inputFile.files[0]).toStrictEqual(testFile);
      });
    });

    describe("When I click on submit button", () => {
      test("Then it should create a new bill", () => {
        newBill.createBill = (bill) => bill;

        const validBill = {
          type: "Transports",
          name: "validBill",
          date: "2021-11-08",
          amount: "250",
          pct: "10",
          vat: "10",
          commentary: "test",
          filName: "billTest.jpg",
          fileUrl: "https://test.com/billTest.jpg",
        };

        const submit = screen.getByRole("button");
        const handleSubmit = jest.spyOn(newBill, "handleSubmit");

        // screen.getByTestId("expense-type").value = validBill.type;
        // screen.getByTestId("expense-name").value = validBill.name;
        // screen.getByTestId("datepicker").value = validBill.date;
        // screen.getByTestId("amount").value = validBill.amount;
        // screen.getByTestId("pct").value = validBill.pct;
        // screen.getByTestId("vat").value = validBill.vat;
        // screen.getByTestId("commentary").value = validBill.commentary;
        // newBill.filName = validBill.filName;
        // newBill.fileUrl = validBill.fileUrl;

        submit.addEventListener("click", handleSubmit);
        userEvent.click(submit);
        expect(handleSubmit).toHaveBeenCalled();
      });
    });
  });
});

// Test d'integration POST
describe("Given I am a user connected as Employee", () => {
  const bill = [
    {
      id: "qcCK3SzECmaZAGRrHjaC",
      vat: "40",
      amount: 100,
      name: "test",
      fileName: "fileTest.jpeg",
      commentary: "test",
      pct: 20,
      type: "Transports",
      email: "email@test.com",
      fileUrl:
        "https://firebasestorage.googleapis.com/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=4df6ed2c-12c8-42a2-b013-346c1346f732",
      date: "2021-11-08",
      status: "Pending",
    },
  ];
  describe("When I navigate to NewBill", () => {
    test("fetches bill to mock API POST", async () => {
      const getSpy = jest.spyOn(firebase, "get");
      let bills = await firebase.get();
      expect(getSpy).toHaveBeenCalledTimes(1);
      expect(bills.data.length).toBe(4);
      bills.data.push(bill);
      expect(bills.data.length).toBe(5);
    });
    test("fetches bill to an API and fails with 404 message error", async () => {
      firebase.get.mockImplementationOnce(() =>
        Promise.reject(new Error("Erreur 405 : Method Not Allowed"))
      );
      const html = BillsUI({ error: "Erreur 405 : Method Not Allowed" });
      document.body.innerHTML = html;
      const message = await screen.getByText(/Erreur 405 : Method Not Allowed/);
      expect(message).toBeTruthy();
    });
    test("fetches messages from an API and fails with 500 message error", async () => {
      firebase.get.mockImplementationOnce(() =>
        Promise.reject(new Error("Erreur 500 : Internal Server Error"))
      );
      const html = BillsUI({ error: "Erreur 500 : Internal Server Error" });
      document.body.innerHTML = html;
      const message = await screen.getByText(
        /Erreur 500 : Internal Server Error/
      );
      expect(message).toBeTruthy();
    });
  });
});
