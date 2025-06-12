import { LanguageString } from "../../../src/core/domain/language-string";
import { Language } from "../../../src/core/domain/language";
import { InvariantError } from "../../../src/core/domain/shared/lpdc-error";

describe("constructing", () => {
  test("can build a full language string", () => {
    const languageString = LanguageString.of(
      "text-nl",
      "text-nl-formal",
      "text-nl-informal",
      "text-nl-generated-formal",
      "text-nl-generated-informal",
    );

    expect(languageString.nl).toEqual("text-nl");
    expect(languageString.nlFormal).toEqual("text-nl-formal");
    expect(languageString.nlInformal).toEqual("text-nl-informal");
    expect(languageString.nlGeneratedFormal).toEqual(
      "text-nl-generated-formal",
    );
    expect(languageString.nlGeneratedInformal).toEqual(
      "text-nl-generated-informal",
    );
  });

  test("can build a languageString with only nl", () => {
    expect(LanguageString.of("text-nl").nl).toEqual("text-nl");
    expect(LanguageString.ofValueInLanguage("text-nl", Language.NL).nl).toEqual(
      "text-nl",
    );
  });

  test("can build a languageString with only nl-formal", () => {
    expect(LanguageString.of(undefined, "text-nl-formal").nlFormal).toEqual(
      "text-nl-formal",
    );
    expect(
      LanguageString.ofValueInLanguage("text-nl-formal", Language.FORMAL)
        .nlFormal,
    ).toEqual("text-nl-formal");
  });

  test("can build a languageString with only nl-informal", () => {
    expect(
      LanguageString.of(undefined, undefined, "text-nl-informal").nlInformal,
    ).toEqual("text-nl-informal");
    expect(
      LanguageString.ofValueInLanguage("text-nl-informal", Language.INFORMAL)
        .nlInformal,
    ).toEqual("text-nl-informal");
  });

  test("can build a languageString with only nl-generated-formal", () => {
    expect(
      LanguageString.of(
        undefined,
        undefined,
        undefined,
        "text-nl-generated-formal",
      ).nlGeneratedFormal,
    ).toEqual("text-nl-generated-formal");
    expect(
      LanguageString.ofValueInLanguage(
        "text-nl-generated-formal",
        Language.GENERATED_FORMAL,
      ).nlGeneratedFormal,
    ).toEqual("text-nl-generated-formal");
  });

  test("can build a languageString with only nl-generated-informal", () => {
    expect(
      LanguageString.of(
        undefined,
        undefined,
        undefined,
        undefined,
        "text-nl-generated-informal",
      ).nlGeneratedInformal,
    ).toEqual("text-nl-generated-informal");
    expect(
      LanguageString.ofValueInLanguage(
        "text-nl-generated-informal",
        Language.GENERATED_INFORMAL,
      ).nlGeneratedInformal,
    ).toEqual("text-nl-generated-informal");
  });

  //TODO LPDC-968: re-enable when empty triples are fixed in data
  test.skip("when no values specified, throws error", () => {
    expect(() => LanguageString.of()).toThrow(
      "language list does not contain one value",
    );
  });
});

describe("get defined languages", () => {
  test("defined language - nl", () => {
    expect(LanguageString.of("nl").definedLanguages).toEqual([Language.NL]);
    expect(
      LanguageString.ofValueInLanguage("nl", Language.NL).definedLanguages,
    ).toEqual([Language.NL]);
  });

  test("defined language - formal", () => {
    expect(
      LanguageString.of(undefined, "text-formal").definedLanguages,
    ).toEqual([Language.FORMAL]);
    expect(
      LanguageString.ofValueInLanguage("text-formal", Language.FORMAL)
        .definedLanguages,
    ).toEqual([Language.FORMAL]);
  });

  test("defined language - informal", () => {
    expect(
      LanguageString.of(undefined, undefined, "text-informal").definedLanguages,
    ).toEqual([Language.INFORMAL]);
    expect(
      LanguageString.ofValueInLanguage("text-informal", Language.INFORMAL)
        .definedLanguages,
    ).toEqual([Language.INFORMAL]);
  });

  test("defined language - generatedFormal", () => {
    expect(
      LanguageString.of(
        undefined,
        undefined,
        undefined,
        "text-generated-formal",
      ).definedLanguages,
    ).toEqual([Language.GENERATED_FORMAL]);
    expect(
      LanguageString.ofValueInLanguage(
        "text-generated-formal",
        Language.GENERATED_FORMAL,
      ).definedLanguages,
    ).toEqual([Language.GENERATED_FORMAL]);
  });

  test("defined language - generatedInFormal", () => {
    expect(
      LanguageString.of(
        undefined,
        undefined,
        undefined,
        undefined,
        "text-generated-informal",
      ).definedLanguages,
    ).toEqual([Language.GENERATED_INFORMAL]);
    expect(
      LanguageString.ofValueInLanguage(
        "text-generated-informal",
        Language.GENERATED_INFORMAL,
      ).definedLanguages,
    ).toEqual([Language.GENERATED_INFORMAL]);
  });

  test("defined languages", () => {
    expect(LanguageString.of("a", "b", "c", "d", "e").definedLanguages).toEqual(
      [
        Language.NL,
        Language.FORMAL,
        Language.INFORMAL,
        Language.GENERATED_FORMAL,
        Language.GENERATED_INFORMAL,
      ],
    );
  });
});

describe("get not blank languages", () => {
  describe("nl", () => {
    test("get not blank language", () => {
      const languageString = LanguageString.of("text-nl");
      expect(languageString.notBlankLanguages).toEqual([Language.NL]);
    });

    test("get blank language", () => {
      const languageString = LanguageString.of("  ");
      expect(languageString.notBlankLanguages).toEqual([]);
    });

    test("get undefined language", () => {
      const languageString = LanguageString.of(undefined);
      expect(languageString.notBlankLanguages).toEqual([]);
    });
  });

  describe("nl formal", () => {
    test("get not blank language", () => {
      const languageString = LanguageString.of(undefined, "text-nl-formal");
      expect(languageString.notBlankLanguages).toEqual([Language.FORMAL]);
    });

    test("get blank language", () => {
      const languageString = LanguageString.of(undefined, "");
      expect(languageString.notBlankLanguages).toEqual([]);
    });

    test("get undefined language", () => {
      const languageString = LanguageString.of(undefined, undefined);
      expect(languageString.notBlankLanguages).toEqual([]);
    });
  });

  describe("nl informal", () => {
    test("get not blank language", () => {
      const languageString = LanguageString.of(
        undefined,
        undefined,
        "text-nl-informal",
      );
      expect(languageString.notBlankLanguages).toEqual([Language.INFORMAL]);
    });

    test("get blank language", () => {
      const languageString = LanguageString.of(undefined, undefined, "");
      expect(languageString.notBlankLanguages).toEqual([]);
    });

    test("get undefined language", () => {
      const languageString = LanguageString.of(undefined, undefined, undefined);
      expect(languageString.notBlankLanguages).toEqual([]);
    });
  });

  describe("nl generated formal", () => {
    test("get not blank language", () => {
      const languageString = LanguageString.of(
        undefined,
        undefined,
        undefined,
        "text-nl-generated-formal",
      );
      expect(languageString.notBlankLanguages).toEqual([
        Language.GENERATED_FORMAL,
      ]);
    });

    test("get blank language", () => {
      const languageString = LanguageString.of(
        undefined,
        undefined,
        undefined,
        "",
      );
      expect(languageString.notBlankLanguages).toEqual([]);
    });

    test("get undefined language", () => {
      const languageString = LanguageString.of(
        undefined,
        undefined,
        undefined,
        undefined,
      );
      expect(languageString.notBlankLanguages).toEqual([]);
    });
  });

  describe("nl generated informal", () => {
    test("get not blank language", () => {
      const languageString = LanguageString.of(
        undefined,
        undefined,
        undefined,
        undefined,
        "text-nl-generated-informal",
      );
      expect(languageString.notBlankLanguages).toEqual([
        Language.GENERATED_INFORMAL,
      ]);
    });

    test("get blank language", () => {
      const languageString = LanguageString.of(
        undefined,
        undefined,
        undefined,
        undefined,
        "",
      );
      expect(languageString.notBlankLanguages).toEqual([]);
    });

    test("get undefined language", () => {
      const languageString = LanguageString.of(
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
      );
      expect(languageString.notBlankLanguages).toEqual([]);
    });
  });
});

describe("compare", () => {
  test("Compare - nl", () => {
    const firstLessThanSecond = LanguageString.compare(
      LanguageString.of("abc"),
      LanguageString.of("def"),
    );
    const firstGreaterThanSecond = LanguageString.compare(
      LanguageString.of("def"),
      LanguageString.of("abc"),
    );
    const firstEqualToSecond = LanguageString.compare(
      LanguageString.of("abc"),
      LanguageString.of("abc"),
    );
    expect(firstLessThanSecond).toEqual(-1);
    expect(firstGreaterThanSecond).toEqual(1);
    expect(firstEqualToSecond).toEqual(0);
  });

  test("Compare - nlFormal", () => {
    const firstLessThanSecond = LanguageString.compare(
      LanguageString.of(undefined, "abc"),
      LanguageString.of(undefined, "def"),
    );
    const firstGreaterThanSecond = LanguageString.compare(
      LanguageString.of(undefined, "def"),
      LanguageString.of(undefined, "abc"),
    );
    const firstEqualToSecond = LanguageString.compare(
      LanguageString.of(undefined, "abc"),
      LanguageString.of(undefined, "abc"),
    );
    expect(firstLessThanSecond).toEqual(-1);
    expect(firstGreaterThanSecond).toEqual(1);
    expect(firstEqualToSecond).toEqual(0);
  });

  test("Compare - nlInformal", () => {
    const firstLessThanSecond = LanguageString.compare(
      LanguageString.of(undefined, undefined, "abc"),
      LanguageString.of(undefined, undefined, "def"),
    );
    const firstGreaterThanSecond = LanguageString.compare(
      LanguageString.of(undefined, undefined, "def"),
      LanguageString.of(undefined, undefined, "abc"),
    );
    const firstEqualToSecond = LanguageString.compare(
      LanguageString.of(undefined, undefined, "abc"),
      LanguageString.of(undefined, undefined, "abc"),
    );
    expect(firstLessThanSecond).toEqual(-1);
    expect(firstGreaterThanSecond).toEqual(1);
    expect(firstEqualToSecond).toEqual(0);
  });

  test("Compare - nlGeneratedFormal", () => {
    const firstLessThanSecond = LanguageString.compare(
      LanguageString.of(undefined, undefined, undefined, "abc"),
      LanguageString.of(undefined, undefined, undefined, "def"),
    );
    const firstGreaterThanSecond = LanguageString.compare(
      LanguageString.of(undefined, undefined, undefined, "def"),
      LanguageString.of(undefined, undefined, undefined, "abc"),
    );
    const firstEqualToSecond = LanguageString.compare(
      LanguageString.of(undefined, undefined, undefined, "abc"),
      LanguageString.of(undefined, undefined, undefined, "abc"),
    );
    expect(firstLessThanSecond).toEqual(-1);
    expect(firstGreaterThanSecond).toEqual(1);
    expect(firstEqualToSecond).toEqual(0);
  });

  test("Compare - nlGeneratedInformal", () => {
    const firstLessThanSecond = LanguageString.compare(
      LanguageString.of(undefined, undefined, undefined, undefined, "abc"),
      LanguageString.of(undefined, undefined, undefined, undefined, "def"),
    );
    const firstGreaterThanSecond = LanguageString.compare(
      LanguageString.of(undefined, undefined, undefined, undefined, "def"),
      LanguageString.of(undefined, undefined, undefined, undefined, "abc"),
    );
    const firstEqualToSecond = LanguageString.compare(
      LanguageString.of(undefined, undefined, undefined, undefined, "abc"),
      LanguageString.of(undefined, undefined, undefined, undefined, "abc"),
    );
    expect(firstLessThanSecond).toEqual(-1);
    expect(firstGreaterThanSecond).toEqual(1);
    expect(firstEqualToSecond).toEqual(0);
  });

  test("Compare - multiple languages - nl and nlFormal", () => {
    const firstLessThanSecond = LanguageString.compare(
      LanguageString.of(undefined, "2"),
      LanguageString.of("1", "2"),
    );
    const firstGreaterThanSecond = LanguageString.compare(
      LanguageString.of("1", "2"),
      LanguageString.of(undefined, "2"),
    );
    const firstEqualToSecond = LanguageString.compare(
      LanguageString.of("1", "2"),
      LanguageString.of("1", "2"),
    );
    expect(firstLessThanSecond).toEqual(-1);
    expect(firstGreaterThanSecond).toEqual(1);
    expect(firstEqualToSecond).toEqual(0);
  });
});

describe("is functionally changed", () => {
  type TestCase = [
    string,
    LanguageString | undefined,
    LanguageString | undefined,
  ];

  const functionallyUnchangedTestCases: TestCase[] = [
    ["nl equal", LanguageString.of("text-nl"), LanguageString.of("text-nl")],
    [
      "nl formal not equal",
      LanguageString.of("text-nl", "abc", "def", "ghi", "kjl"),
      LanguageString.of("text-nl", "abcd", "def", "ghi", "kjl"),
    ],
    [
      "nl informal not equal",
      LanguageString.of("text-nl", "abc", "def", "ghi", "kjl"),
      LanguageString.of("text-nl", "abc", "defd", "ghi", "kjl"),
    ],
    [
      "nl generated formal not equal",
      LanguageString.of("text-nl", "abc", "def", "ghi", "kjl"),
      LanguageString.of("text-nl", "abc", "def", "ghid", "kjl"),
    ],
    [
      "nl generated informal not equal",
      LanguageString.of("text-nl", "abc", "def", "ghi", "kjl"),
      LanguageString.of("text-nl", "abc", "def", "ghi", "kjld"),
    ],
    [
      "nl equal; other languages undefined ",
      LanguageString.of("text-nl", "abc", "def", "ghi", "kjl"),
      LanguageString.of("text-nl", undefined, undefined, undefined, undefined),
    ],
    [
      "nl equal; this languages undefined",
      LanguageString.of("text-nl", undefined, undefined, undefined, undefined),
      LanguageString.of("text-nl", "abc", "def", "ghi", "kjl"),
    ],
  ];

  for (const testCase of functionallyUnchangedTestCases) {
    test(`not functionally changed when ${testCase[0]}`, () => {
      expect(
        LanguageString.isFunctionallyChanged(testCase[1], testCase[2]),
      ).toBeFalsy();
    });
  }

  const functionallyChangedTestCases: TestCase[] = [
    [
      "nl changed",
      LanguageString.of("text-nl"),
      LanguageString.of("text-nl-changed"),
    ],
    ["one undefined, other defined", undefined, LanguageString.of("text-nl")],
    ["one defined, other undefined", LanguageString.of("text-nl"), undefined],
    [
      "one nl undefined and other nl defined",
      LanguageString.of(undefined),
      LanguageString.of("text-nl"),
    ],
    [
      "one nl undefined and other nl",
      LanguageString.of("text-nl"),
      LanguageString.of(undefined),
    ],
  ];
  for (const testCase of functionallyChangedTestCases) {
    test(`functionally changed when ${testCase[0]}`, () => {
      expect(
        LanguageString.isFunctionallyChanged(testCase[1], testCase[2]),
      ).toBeTruthy();
    });
  }
});

describe("extract nl languages", () => {
  test("if no nl lang is present, return empty list", () => {
    const languages = LanguageString.of();

    expect(LanguageString.extractLanguages([languages])).toEqual([]);
  });

  test("if only undefined is present, return empty list", () => {
    expect(LanguageString.extractLanguages([undefined])).toEqual([]);
  });

  test("if only undefined language string is present, return empty list", () => {
    expect(
      LanguageString.extractLanguages([
        LanguageString.of(undefined, undefined),
      ]),
    ).toEqual([]);
  });

  test("if language versions are present, correctly return values ", () => {
    const langs1 = LanguageString.of("nl");
    const langs2 = LanguageString.of(undefined, "nl-formal");
    const strings = [langs1, langs2];

    expect(LanguageString.extractLanguages(strings)).toEqual([
      "nl",
      "nl-be-x-formal",
    ]);
  });

  test("if languages are filled in for multiple values return it only one time", () => {
    const langs1 = LanguageString.of(undefined, "nl-formal");
    const langs2 = LanguageString.of(undefined, "nl-formal");
    const strings = [langs1, langs2];

    expect(LanguageString.extractLanguages(strings)).toEqual([
      "nl-be-x-formal",
    ]);
  });
});

describe("validate unique nl language", () => {
  test("if no nl lang is present, do not throw", () => {
    const languages = LanguageString.of();

    expect(() =>
      LanguageString.validateUniqueLanguage([languages]),
    ).not.toThrow();
  });

  test("if only undefined is present, do not throw", () => {
    expect(() =>
      LanguageString.validateUniqueLanguage([undefined]),
    ).not.toThrow();
  });

  test("if only undefined language string is present, do not throw", () => {
    expect(() =>
      LanguageString.validateUniqueLanguage([
        LanguageString.of(undefined, undefined),
      ]),
    ).not.toThrow();
  });

  test("if a language versions is present, do not throw ", () => {
    const langs1 = LanguageString.of("nl");
    const langs2 = LanguageString.of(undefined);
    const strings = [langs1, langs2];

    expect(() => LanguageString.validateUniqueLanguage(strings)).not.toThrow();
  });

  test("if languages are filled in for multiple values, do not throw", () => {
    const langs1 = LanguageString.of(undefined, "nl-formal");
    const langs2 = LanguageString.of(undefined, "nl-formal");
    const strings = [langs1, langs2];

    expect(() => LanguageString.validateUniqueLanguage(strings)).not.toThrow();
  });

  test("if multiple nl values are present, throw error", () => {
    expect(() =>
      LanguageString.validateUniqueLanguage([
        LanguageString.of("nl", "nl-formal"),
      ]),
    ).toThrowWithMessage(InvariantError, "Er is meer dan een nl-taal aanwezig");
  });

  test("if multiple nl values are present throughout multiple values , throw error", () => {
    const langs1 = LanguageString.of(undefined, "nl-formal");
    const langs2 = LanguageString.of("nl", undefined);
    const strings = [langs1, langs2];

    expect(() =>
      LanguageString.validateUniqueLanguage(strings),
    ).toThrowWithMessage(InvariantError, "Er is meer dan een nl-taal aanwezig");
  });
});

describe("isAbsent", () => {
  for (const language of Object.values(Language)) {
    test(`when value is undefined for language ${language}, returns true`, () => {
      expect(LanguageString.isAbsent(undefined, language)).toBeTrue();
    });
  }

  test(`when value is defined`, () => {
    expect(
      LanguageString.isAbsent(LanguageString.of("nl"), Language.NL),
    ).toBeFalse();
    expect(
      LanguageString.isAbsent(LanguageString.of("nl"), Language.FORMAL),
    ).toBeTrue();
    expect(
      LanguageString.isAbsent(LanguageString.of("nl"), Language.INFORMAL),
    ).toBeTrue();
    expect(
      LanguageString.isAbsent(
        LanguageString.of("nl"),
        Language.GENERATED_FORMAL,
      ),
    ).toBeTrue();
    expect(
      LanguageString.isAbsent(
        LanguageString.of("nl"),
        Language.GENERATED_INFORMAL,
      ),
    ).toBeTrue();

    expect(
      LanguageString.isAbsent(
        LanguageString.of(undefined, "nlFormal"),
        Language.NL,
      ),
    ).toBeTrue();
    expect(
      LanguageString.isAbsent(
        LanguageString.of(undefined, "nlFormal"),
        Language.FORMAL,
      ),
    ).toBeFalse();
    expect(
      LanguageString.isAbsent(
        LanguageString.of(undefined, "nlFormal"),
        Language.INFORMAL,
      ),
    ).toBeTrue();
    expect(
      LanguageString.isAbsent(
        LanguageString.of(undefined, "nlFormal"),
        Language.GENERATED_FORMAL,
      ),
    ).toBeTrue();
    expect(
      LanguageString.isAbsent(
        LanguageString.of(undefined, "nlFormal"),
        Language.GENERATED_INFORMAL,
      ),
    ).toBeTrue();
  });

  test(`when value is blank`, () => {
    expect(
      LanguageString.isAbsent(LanguageString.of("     "), Language.NL),
    ).toBeTrue();
    expect(
      LanguageString.isAbsent(LanguageString.of("     "), Language.FORMAL),
    ).toBeTrue();
    expect(
      LanguageString.isAbsent(LanguageString.of("     "), Language.INFORMAL),
    ).toBeTrue();
    expect(
      LanguageString.isAbsent(
        LanguageString.of("     "),
        Language.GENERATED_FORMAL,
      ),
    ).toBeTrue();
    expect(
      LanguageString.isAbsent(
        LanguageString.of("     "),
        Language.GENERATED_INFORMAL,
      ),
    ).toBeTrue();

    expect(
      LanguageString.isAbsent(LanguageString.of(undefined, "   "), Language.NL),
    ).toBeTrue();
    expect(
      LanguageString.isAbsent(
        LanguageString.of(undefined, "   "),
        Language.FORMAL,
      ),
    ).toBeTrue();
    expect(
      LanguageString.isAbsent(
        LanguageString.of(undefined, "   "),
        Language.INFORMAL,
      ),
    ).toBeTrue();
    expect(
      LanguageString.isAbsent(
        LanguageString.of(undefined, "   "),
        Language.GENERATED_FORMAL,
      ),
    ).toBeTrue();
    expect(
      LanguageString.isAbsent(
        LanguageString.of(undefined, "   "),
        Language.GENERATED_INFORMAL,
      ),
    ).toBeTrue();
  });
});
