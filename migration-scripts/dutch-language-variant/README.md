# Migration dutch-language-variant

When running this migration-script, u must comment this line in the constructor of Instance
`this._dutchLanguageVariant = requireShouldEqualAcceptedValue(dutchLanguageVariant, 'dutchLanguageVariant', instanceLanguages);`

