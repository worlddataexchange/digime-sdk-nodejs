---
title: File Metadata
---

# File Metadata

The type of FileMetadata that is returned depends on the type of data it is.

### MappedFileMetadata

When reading data that was sync'd from an external service, data returned will be of type {@link Types.MappedFileMetadata | MappedFileMetadata}.

```
interface MappedFileMetadata {
    objectCount: number;
    objectType: string;
    serviceGroup: string;
    serviceName: string;
    schema: FileDataSchema;
}

type Schemas = "fhir" | "me.digi";

interface FileDataSchema {
    id?: string;
    standard: Schemas; // Current supported schemas
    version: string; // SemVer, ie "1.0.0"
}

```

### RawFileMetadata

If it is a file that you wrote to the user, it will be of type {@link Types.RawFileMetadata | RawFileMetadata}.

```
interface RawFileMetadata {
    mimetype: string;
    accounts: {
        accountid: string,
    }[];
    reference?: string[];
    tags?: string[];
}
```

| Property    | Description                                                | Data type     |
| ----------- | ---------------------------------------------------------- | ------------- |
| `mimetype`  | The mimetype of this data blob.                            | string        |
| `accounts`  | An array of account IDs that was pushed up with this file. | UserAccount[] |
| `tags`      | Any tags linked to this file when it was pushed up.        | string[]      |
| `reference` | Any references linked to this file when it was pushed up.  | string[]      |
