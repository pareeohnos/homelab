import * as pulumi from "@pulumi/pulumi";
import * as fs from "fs";
import * as os from "os";
import { GeneralConfiguration } from "./types";

export const getSshKey = () => {
  const config = new pulumi.Config();
  const generalConfig = config.requireObject<GeneralConfiguration>("general");
  const homedir = os.homedir();
  return fs
    .readFileSync(`${homedir}/.ssh/${generalConfig.sshPublicKeyFilename}`)
    .toString();
};
