let chosenForm: "formal" | "informal" | undefined;

export function setChosenForm(form: "formal" | "informal" | undefined) {
  chosenForm = form;
}

export function getChosenForm(): "formal" | "informal" | undefined {
  return chosenForm;
}
