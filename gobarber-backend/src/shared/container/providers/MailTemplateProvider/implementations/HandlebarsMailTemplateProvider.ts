import handlebars from 'handlebars';
import fs from 'fs';

import IMailTemplateProvider from "../models/IMailTemplateProvider";
import IParseMailTemplateDTO from "../dtos/IParseMailTemplateDTO";

export default class HandlebarsMailTemplateProvider implements IMailTemplateProvider {
  public async parse({ file, variables }: IParseMailTemplateDTO): Promise<string> {
    const templateFileContent = await fs.promises.readFile(file, {
      encoding: 'utf8',
    });

    const parseTramplate = handlebars.compile(templateFileContent);

    return parseTramplate(variables);
  }
}