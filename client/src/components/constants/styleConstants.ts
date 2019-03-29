import { colors } from "./colors";

export const BORDER_RADIUS = 4;

export const BUTTON = {
  button: {
    background: "transparent",
    color: colors.green,
    padding: [10, 20],
    fontSize: 14,
    textTransform: "uppercase",
    letterSpacing: 1,
    borderRadius: BORDER_RADIUS,
    cursor: "pointer",
    border: [2, "solid", colors.green],

    "&:hover": {
      background: colors.green,
      color: colors.black
    }
  }
};

export const FORM_FIELD = {
  formField: {
    width: "100%",
    borderBottomLeftRadius: BORDER_RADIUS,
    borderBottomRightRadius: BORDER_RADIUS,
    border: [2, "solid", colors.yellow],
    fontSize: 14,
    lineHeight: "16px",
    padding: [10, 5],
    margin: [5, 0, 15, 0]
  }
};

export const LABEL = {
  label: {
    flex: [1, 0, 0],
    width: "100%",
    fontSize: 16,
    color: colors.yellow,
    textTransform: "capitalize",
    letterSpacing: 1
  }
};

export const FORM_INPUTS = {
  ...FORM_FIELD,
  ...LABEL,
  ...BUTTON,
  facebookLogin: {
    widht: "100%",
    borderColor: "#3C5A99",
    color: "#3C5A99",
    marginTop: 20,

    "&:hover": {
      background: "#3C5A99",
      color: colors.black
    }
  },
  oauthContainer: {
    padding: [25, 0],
    color: "#f1f1f1"
  }
};
