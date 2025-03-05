import {
  SearchIndexClient,
  AzureKeyCredential,
  SearchIndex,
} from "@azure/search-documents";
import {
  AZURE_SEARCH_ENDPOINT,
  AZURE_SEARCH_KEY,
  AZURE_SEARCH_INDEX_NAME,
} from "./envConstants";

export async function createIndex() {
  const client = new SearchIndexClient(
    AZURE_SEARCH_ENDPOINT,
    new AzureKeyCredential(AZURE_SEARCH_KEY)
  );

  const index: SearchIndex = {
    name: AZURE_SEARCH_INDEX_NAME,
    fields: [
      { name: "id", type: "Edm.String", key: true },
      { name: "name", type: "Edm.String", filterable: true },
      { name: "variant", type: "Edm.String", filterable: true },
      { name: "url", type: "Edm.String", filterable: true },
      {
        name: "vector",
        type: "Collection(Edm.Single)",
        searchable: true,
        vectorSearchDimensions: 1024,
        vectorSearchProfileName: "myHnswProfile",
      },
    ],
    vectorSearch: {
      algorithms: [{ name: "myHnswAlgorithm", kind: "hnsw" }],
      profiles: [
        {
          name: "myHnswProfile",
          algorithmConfigurationName: "myHnswAlgorithm",
        },
      ],
    },
  };

  await client.createOrUpdateIndex(index);
  console.log(
    `✅ Index '${AZURE_SEARCH_INDEX_NAME}' created/updated successfully!`
  );
}
