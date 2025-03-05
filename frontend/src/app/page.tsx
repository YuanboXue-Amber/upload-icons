"use client";

import { FileUploadSearch } from "@/components/file-upload-search";
import {
  FluentProvider,
  makeStyles,
  webLightTheme,
} from "@fluentui/react-components";

const useStyles = makeStyles({
  root: {
    margin: "24px",
  },
  heading: {
    textAlign: "center",
    marginBottom: "24px",
    fontSize: "1.875rem",
    fontWeight: "bold",
  },
});

export default function Home() {
  const styles = useStyles();
  return (
    <FluentProvider theme={webLightTheme}>
      <main className={styles.root}>
        <h1 className={styles.heading}>Icon Search</h1>
        <FileUploadSearch />
      </main>
    </FluentProvider>
  );
}
