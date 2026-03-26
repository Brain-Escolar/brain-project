import { TextField } from "@mui/material";
import React from "react";
import { StyledTextField } from "./styles";

interface IBrainTextFieldProps extends React.ComponentProps<typeof TextField> {
  id?: string;
}

function BrainTextField(props: IBrainTextFieldProps) {
  return <StyledTextField {...props} fullWidth={true} type={"text"} error={!!props.error} />;
}

export default BrainTextField;
