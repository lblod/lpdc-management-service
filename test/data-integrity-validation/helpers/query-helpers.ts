import { isLiteral, Statement } from "rdflib";

export function sanitizeBooleans(statements: Statement[]): Statement[] {
  return statements.map((q) => {
    if (
      isLiteral(q.object) &&
      q.object.datatype.value === "http://www.w3.org/2001/XMLSchema#boolean"
    ) {
      q.object.value === "1"
        ? (q.object.value = "true")
        : (q.object.value = "false");
    }
    return q;
  });
}
