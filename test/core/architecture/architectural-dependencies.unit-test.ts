// architectural-dependencies.unit-test.ts
import * as ts from "typescript";
import {readdirSync, statSync} from "fs";
import {dirname, join, relative} from "path";

describe('Hexagonal Architecture', () => {
    const domain = 'core/domain';
    const ports = 'core/port';
    const applicationLayer = 'core/application';
    const drivenAdapter = 'driven';
    const drivingAdapter = 'driving';

    test('Domain should only depend on port', () => {
        expect(checkDependency(domain, [ports])).toEqual([]);
    });

    test('Ports should only depend on domain', () => {
        expect(checkDependency(ports, [domain])).toEqual([]);
    });

    test('Application layer should only depend on domain and ports', () => {
        expect(checkDependency(applicationLayer, [domain, ports])).toEqual([]);
    });

    test('Driven adapter should only depend on domain and ports', () => {
        expect(checkDependency(drivenAdapter, [domain, ports])).toEqual([]);
    });

    test('Driving adapter should only depend on domain and ports', () => {
        expect(checkDependency(drivingAdapter, [domain, ports])).toEqual([]);
    });


});

function checkDependency(source: string, acceptedSources: string[]): string[] {
    const projectRoot = join(__dirname, '../../../src');
    const sourceDir = join(projectRoot, source);

    const acceptedDirs = acceptedSources.map(source => join(projectRoot, source));
    acceptedDirs.push(sourceDir);
    const violations: string[] = [];

    // Read all domain files
    const sourceFiles = getAllFilesAndNestedFilesFromDir(sourceDir);
    const sourceProgram = ts.createProgram(sourceFiles, {noEmit: true});

    for (const sourceFile of sourceProgram.getSourceFiles()) {
        // Only check files within the domain directory
        if (sourceFiles.includes(sourceFile.fileName)) {
            ts.forEachChild(sourceFile, node => {
                if (ts.isImportDeclaration(node)) {
                    // Resolve the full path of the import relative to the source file
                    const importPath = (node.moduleSpecifier as ts.StringLiteral).text;
                    const fullImportPath = join(dirname(sourceFile.fileName), importPath);
                    if (fullImportPath.startsWith(projectRoot) && !acceptedDirs.some(access => fullImportPath.startsWith(access))) {
                        const relativeImportPath = relative(projectRoot, fullImportPath);
                        const relativeSourceFilePath = relative(projectRoot, sourceFile.fileName);
                        violations.push(`Illegal import: '${relativeImportPath}' in '${relativeSourceFilePath}'`);
                    }
                }
            });
        }
    }

    return violations;
}

function getAllFilesAndNestedFilesFromDir(dir: string, filelist: string[] = []): string[] {
    const files = readdirSync(dir);

    files.forEach(file => {
        const filepath = join(dir, file);
        const stat = statSync(filepath);

        if (stat.isDirectory()) {
            filelist = getAllFilesAndNestedFilesFromDir(filepath, filelist); // Recurse into subdirectory
        } else if (file.endsWith('.ts')) {
            filelist.push(filepath); // Add TypeScript file to list
        }
    });

    return filelist;
}