"use client";

import type React from "react";

import { useState } from "react";
import axios from "axios";
import { FileUploader } from "./file-uploader";
import { UrlInput } from "./url-input";
import { type Icon, IconGrid } from "./icon-grid";
import {
  Button,
  TabList,
  Tab,
  makeStyles,
  tokens,
  type TabValue,
  TabListProps,
  Spinner,
  Text,
} from "@fluentui/react-components";

const useStyles = makeStyles({
  container: {
    maxWidth: "800px",
    margin: "0 auto",
    padding: "0 16px",
  },
  tabContent: {
    marginTop: tokens.spacingVerticalM,
    marginBottom: tokens.spacingVerticalL,
  },
  buttonContainer: {
    display: "flex",
    justifyContent: "center",
    marginTop: tokens.spacingVerticalL,
    marginBottom: tokens.spacingVerticalL,
  },
  button: {
    minWidth: "120px",
  },
  spinner: {
    display: "flex",
    justifyContent: "center",
    marginTop: tokens.spacingVerticalL,
  },
  selectedFile: {
    textAlign: "center",
    marginTop: "8px",
  },
});

export function FileUploadSearch() {
  const styles = useStyles();
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState("");
  const [icons, setIcons] = useState<Icon[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<TabValue>("file");

  const handleFileChange = (uploadedFile: File | null) => {
    setFile(uploadedFile);
    setIcons([]);
  };

  const handleUrlChange = (inputUrl: string) => {
    setUrl(inputUrl);
    setIcons([]);
  };

  const handleSearch = async () => {
    setLoading(true);
    setIcons([]);

    const formData = new FormData();
    if (activeTab === "file" && file) {
      formData.append("image", file);
    } else if (activeTab === "url" && url) {
      formData.append("imageUrl", url);
    } else {
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post("api/search", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setIcons(response.data);
    } catch (error) {
      console.error("Error searching icons:", error);
      alert("Failed to fetch icons. Please check the server.");
    } finally {
      setLoading(false);
    }
  };

  const handleTabSelect: TabListProps["onTabSelect"] = (
    _event,
    data: { value: TabValue }
  ) => {
    setActiveTab(data.value);
    setIcons([]);
  };

  const isSearchDisabled =
    (activeTab === "file" && !file) || (activeTab === "url" && !url);

  return (
    <div className={styles.container}>
      <TabList selectedValue={activeTab} onTabSelect={handleTabSelect}>
        <Tab value='file'>Upload File</Tab>
        <Tab value='url'>Enter URL</Tab>
      </TabList>

      <div className={styles.tabContent}>
        {activeTab === "file" && (
          <>
            <FileUploader onFileChange={handleFileChange} />
            {file && (
              <div className={styles.selectedFile}>
                Selected file: <Text italic>{file.name}</Text>
              </div>
            )}
          </>
        )}

        {activeTab === "url" && <UrlInput onUrlChange={handleUrlChange} />}
      </div>

      <div className={styles.buttonContainer}>
        <Button
          appearance='primary'
          onClick={handleSearch}
          disabled={isSearchDisabled || loading}
          className={styles.button}
        >
          {loading ? "Searching..." : "Search"}
        </Button>
      </div>

      {loading && (
        <div className={styles.spinner}>
          <Spinner label='Searching...' />
        </div>
      )}

      {!loading && icons.length > 0 && <IconGrid icons={icons} />}
    </div>
  );
}
