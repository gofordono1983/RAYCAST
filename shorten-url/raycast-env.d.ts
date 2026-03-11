/// <reference types="@raycast/api">

/* 🚧 🚧 🚧
 * This file is auto-generated from the extension's manifest.
 * Do not modify manually. Instead, update the `package.json` file.
 * 🚧 🚧 🚧 */

/* eslint-disable @typescript-eslint/ban-types */

type ExtensionPreferences = {
  /** Shlink Server URL - Your Shlink instance URL (e.g. https://link.dno.sh) */
  "shlinkUrl": string,
  /** Shlink API Key - API key generated via shlink api-key:generate */
  "shlinkApiKey": string
}

/** Preferences accessible in all the extension's commands */
declare type Preferences = ExtensionPreferences

declare namespace Preferences {
  /** Preferences accessible in the `shorten-url` command */
  export type ShortenUrl = ExtensionPreferences & {}
}

declare namespace Arguments {
  /** Arguments passed to the `shorten-url` command */
  export type ShortenUrl = {}
}

