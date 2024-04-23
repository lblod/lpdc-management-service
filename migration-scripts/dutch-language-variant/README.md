# Migration dutch-language-variant

When running this migration-script, u must comment this line in the constructor of Instance

`this._dutchLanguageVariant = requireShouldEqualAcceptedValue(dutchLanguageVariant, 'dutchLanguageVariant', instanceLanguages);`


`if (calculatedInstanceNLLanguages.length != 0 && calculatedInstanceNLLanguages[0] != this.dutchLanguageVariant) {
throw new InvariantError('DutchLanguageVariant verschilt van de calculatedInstanceNlLanguages');
}`

