import {
  BuildArtifacts,
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
  compareStorageLayouts,
  Contract as ZContract,
  getStorageLayout,
  Operation,
<<<<<<< HEAD:packages/protocol/lib/layout.ts
  StorageLayoutInfo,
<<<<<<< HEAD
=======
=======
  Operation,
>>>>>>> Move functions from script to library
  getStorageLayout,
  compareStorageLayouts,
  Contract as ZContract
>>>>>>> Add script for layout checking
=======
  compareStorageLayouts,
  Contract as ZContract,
  getStorageLayout,
  Operation,
>>>>>>> Appease the linter
=======
>>>>>>> Appease the linter
} from '@openzeppelin/upgrades'
const  Web3 = require('web3')
=======
  StorageLayoutInfo
<<<<<<< HEAD
} from '@openzeppelin/upgrades';
>>>>>>> Add backward compatibility check for contracts api based on the compiled AST:packages/protocol/lib/backward/ast-layout.ts
import { Contract as Web3Contract } from 'web3-eth-contract';
=======
} from '@openzeppelin/upgrades'
import { Contract as Web3Contract } from 'web3-eth-contract'
>>>>>>> Remove unnecessary semi-colons
const Web3 = require('web3')

const web3 = new Web3(null)

// Inlined from OpenZeppelin SDK since its not exported.
<<<<<<< HEAD
<<<<<<< HEAD
interface Artifact {
  abi: any[]
  ast: any
  bytecode: string
  compiler: any
  contractName: string
  deployedBytecode: string
  deployedSourceMap: string
  fileName: string
  legacyAST?: any
  networks: any
  schemaVersion: string
  source: string
  sourceMap: string
  sourcePath: string
  updatedAt: string
}

// Inlined from OpenZeppelin SDK since its not exported.
interface TypeInfo {
  id: string;
  kind: string;
  label: string;
  valueType?: string;
  length?: number;
  members?: StorageInfo[];
  src?: any;
}

// Inlined from OpenZeppelin SDK since its not exported.
interface StorageInfo {
  label: string;
  astId: number;
  type: any;
  src: string;
  path?: string;
  contract?: string;
=======
export interface Artifact {
<<<<<<< HEAD
  abi: any[];
  ast: any;
  bytecode: string;
  compiler: any;
  contractName: string;
  deployedBytecode: string;
  deployedSourceMap: string;
  fileName: string;
  legacyAST?: any;
  networks: any;
  schemaVersion: string;
  source: string;
  sourceMap: string;
  sourcePath: string;
  updatedAt: string;
>>>>>>> Add script for layout checking
=======
=======
interface Artifact {
>>>>>>> Check if struct definitions changed
  abi: any[]
  ast: any
  bytecode: string
  compiler: any
  contractName: string
  deployedBytecode: string
  deployedSourceMap: string
  fileName: string
  legacyAST?: any
  networks: any
  schemaVersion: string
  source: string
  sourceMap: string
  sourcePath: string
  updatedAt: string
>>>>>>> Move functions from script to library
}

// Inlined from OpenZeppelin SDK since its not exported.
interface TypeInfo {
  id: string
  kind: string
  label: string
  valueType?: string
  length?: number
  members?: StorageInfo[]
  src?: any
}

// Inlined from OpenZeppelin SDK since its not exported.
interface StorageInfo {
  label: string
  astId: number
  type: any
  src: string
  path?: string
  contract?: string
}

// getStorageLayout needs an oz-sdk Contract class instance. This class is a
// subclass of Contract from web3-eth-contract, with an added .schema member and
// several methods.
//
// Couldn't find an easy way of getting one just from contract artifacts. But
// for getStorageLayout we really only need .schema.ast and .schema.contractName.
const addSchemaForLayoutChecking = (web3Contract: Web3Contract, artifact: any): ZContract => {
  // @ts-ignore
  const contract = web3Contract as Contract
<<<<<<< HEAD
<<<<<<< HEAD
  // @ts-ignore
=======
  //@ts-ignore
>>>>>>> Add script for layout checking
=======
  // @ts-ignore
>>>>>>> Appease the linter
  contract.schema = {}
  contract.schema.ast = artifact.ast
  contract.schema.contractName = artifact.contractName
  return contract
}

const makeZContract = (artifact: any): ZContract => {
  const contract = new web3.eth.Contract(artifact.abi)

  return addSchemaForLayoutChecking(contract, artifact)
}

<<<<<<< HEAD
<<<<<<< HEAD
export const getLayout = (artifact: Artifact, artifacts: BuildArtifacts) => {
  const contract = makeZContract(artifact)

  return getStorageLayout(contract, artifacts)
}

const selectIncompatibleOperations = (diff: Operation[]) =>
  diff.filter(operation => operation.action !== 'append')

export interface CompatibilityInfo {
  contract: string
  compatible: boolean
  errors: string[]
}

const operationToDescription = (operation: Operation) => {
  let message: string

  const updated = operation.updated
  const original = operation.original

  switch (operation.action) {
    case 'typechange':
      message = `variable ${updated.label} had type ${original.type}, now has type ${updated.type}`
      break
    case 'insert':
      message = `variable ${updated.label} was inserted`
      break
    case 'pop':
      message = `variable ${original.label} was removed`
      break
    case 'delete':
      message = `variable ${original.label} was removed`
      break
    case 'rename':
      message = `variable ${updated.label} was renamed from ${original.label}`
      break
    case 'append':
      message = `variable ${updated.label} was appended`

    default:
      message = `unknown operation ${operation.action}`
  }

  return message
}

const generateLayoutCompatibilityReport = (oldLayout: StorageLayoutInfo, newLayout: StorageLayoutInfo) => {
  const diff = compareStorageLayouts(oldLayout, newLayout)
  const incompatibilities = selectIncompatibleOperations(diff)
  if (incompatibilities.length === 0) {
    return {
      compatible: true,
      errors: []
    }
  } else {
    return {
      compatible: false,
      errors: incompatibilities.map(operationToDescription)
    }
  }
}

const compareStructDefinitions = (oldType: TypeInfo, newType: TypeInfo) => {
  if (oldType.kind !== 'struct') {
    return {
      same: false,
      errors: [`${newType.label} wasn't a struct type, now is`]
    }
  }

  if (oldType.members.length !== newType.members.length) {
    return {
      same: false,
      errors: [`struct ${newType.label} has changed members`]
    }
  }

  const memberErrors = newType.members.map((newMember, i) => {
    const oldMember = oldType.members[i]
    if (oldMember.label !== newMember.label) {
      return `struct ${newType.label} had ${oldMember.label} in slot ${i}, now has ${newMember.label}`
    } 

    if (oldMember.type !== newMember.type) {
      return `struct ${newType.label}'s member ${newMember.label} changed type from ${oldMember.type} to ${newMember.type}`
    }

    return ''
  }).filter(error => error !== '')

  return {
    same: memberErrors.length === 0,
    errors: memberErrors
  }
}

const generateStructsCompatibilityReport = (oldLayout: StorageLayoutInfo, newLayout: StorageLayoutInfo) => {
  let compatible = true
  let errors = []

  Object.keys(newLayout.types).forEach(typeName => {
    const newType = newLayout.types[typeName]
    const oldType = oldLayout.types[typeName]

    if (newType.kind === 'struct' && oldType !== undefined) {
      const structReport = compareStructDefinitions(oldType, newType)
      if (!structReport.same) {
        compatible = false
        errors = errors.concat(structReport.errors)
      }
    }
  })

  return {
    compatible,
    errors
  }
}

export const generateCompatibilityReport  = (oldArtifact: Artifact, oldArtifacts: BuildArtifacts,
                       newArtifact: Artifact, newArtifacts: BuildArtifacts) => {
      const oldLayout = getLayout(oldArtifact, oldArtifacts)
      const newLayout = getLayout(newArtifact, newArtifacts)
      const layoutReport = generateLayoutCompatibilityReport(oldLayout, newLayout)
      const structsReport = generateStructsCompatibilityReport(oldLayout, newLayout)
      return {
        contract: newArtifact.contractName,
        compatible: layoutReport.compatible && structsReport.compatible,
        errors: layoutReport.errors.concat(structsReport.errors)
      }
}

export const reportLayoutIncompatibilities = (oldArtifacts: BuildArtifacts, newArtifacts: BuildArtifacts): CompatibilityInfo[] => {
  return newArtifacts.listArtifacts().map((newArtifact) => {
    const oldArtifact = oldArtifacts.getArtifactByName(newArtifact.contractName)
    if (oldArtifact !== undefined) {
      return generateCompatibilityReport(oldArtifact, oldArtifacts, newArtifact, newArtifacts)
    }
  })
=======
export const getLayoutDiff = (oldArtifact: Artifact, oldArtifacts: BuildArtifacts,
                       newArtifact: Artifact, newArtifacts: BuildArtifacts) => {
  const oldContract = makeZContract(oldArtifact)
  const newContract = makeZContract(newArtifact)

  const oldLayout = getStorageLayout(oldContract, oldArtifacts)
  const newLayout = getStorageLayout(newContract, newArtifacts)

  return compareStorageLayouts(oldLayout, newLayout)
>>>>>>> Add script for layout checking
=======
export const getLayout = (artifact: Artifact, artifacts: BuildArtifacts) => {
  const contract = makeZContract(artifact)

  return getStorageLayout(contract, artifacts)
>>>>>>> Check if struct definitions changed
}

const selectIncompatibleOperations = (diff: Operation[]) =>
  diff.filter(operation => operation.action !== 'append')

export interface ASTStorageCompatibilityReport {
  contract: string
  compatible: boolean
  errors: string[]
}

const generateErrorMessage = (operation: Operation) => {
  let message: string

  const updated = operation.updated
  const original = operation.original

  switch (operation.action) {
    case 'typechange':
      message = `variable ${updated.label} had type ${original.type}, now has type ${updated.type}`
      break
    case 'insert':
      message = `variable ${updated.label} was inserted`
      break
    case 'pop':
      message = `variable ${original.label} was removed`
      break
    case 'delete':
      message = `variable ${original.label} was removed`
      break
    case 'rename':
      message = `variable ${updated.label} was renamed from ${original.label}`
      break
    default:
      message = `unknown operation ${operation.action}`
  }

  return message
}

const generateLayoutCompatibilityReport = (oldLayout: StorageLayoutInfo, newLayout: StorageLayoutInfo) => {
  const diff = compareStorageLayouts(oldLayout, newLayout)
  const incompatibilities = selectIncompatibleOperations(diff)
  if (incompatibilities.length === 0) {
    return {
      compatible: true,
      errors: []
    }
  } else {
    return {
      compatible: false,
      errors: incompatibilities.map(generateErrorMessage)
    }
  }
}

const compareStructDefinitions = (oldType: TypeInfo, newType: TypeInfo) => {
  if (oldType.kind !== 'struct') {
    return {
      same: false,
      errors: [`${newType.label} wasn't a struct type, now is`]
    }
  }

  if (oldType.members.length !== newType.members.length) {
    return {
      same: false,
      errors: [`struct ${newType.label} has changed members`]
    }
  }

  const memberErrors = newType.members.map((newMember, i) => {
    const oldMember = oldType.members[i]
    if (oldMember.label !== newMember.label) {
      return `struct ${newType.label} has new member ${newMember.label}`
    }

    if (oldMember.type !== newMember.type) {
      return `struct ${newType.label}'s member ${newMember.label} changed type from ${oldMember.type} to ${newMember.type}`
    }

    return ''
  }).filter(error => error !== '')

  return {
    same: memberErrors.length === 0,
    errors: memberErrors
  }
}

const generateStructsCompatibilityReport = (oldLayout: StorageLayoutInfo, newLayout: StorageLayoutInfo) => {
  let compatible = true
  let errors = []

  Object.keys(newLayout.types).forEach(typeName => {
    const newType = newLayout.types[typeName]
    const oldType = oldLayout.types[typeName]

    if (newType.kind === 'struct' && oldType !== undefined) {
      const structReport = compareStructDefinitions(oldType, newType)
      if (!structReport.same) {
        compatible = false
        errors = errors.concat(structReport.errors)
      }
    }
  })

  return {
    compatible,
    errors
  }
}

export const generateCompatibilityReport = (oldArtifact: Artifact, oldArtifacts: BuildArtifacts,
  newArtifact: Artifact, newArtifacts: BuildArtifacts) => {
  const oldLayout = getLayout(oldArtifact, oldArtifacts)
  const newLayout = getLayout(newArtifact, newArtifacts)
  const layoutReport = generateLayoutCompatibilityReport(oldLayout, newLayout)
  const structsReport = generateStructsCompatibilityReport(oldLayout, newLayout)
  return {
    contract: newArtifact.contractName,
    compatible: layoutReport.compatible && structsReport.compatible,
    errors: layoutReport.errors.concat(structsReport.errors)
  }
}

export const reportLayoutIncompatibilities = (oldArtifacts: BuildArtifacts, newArtifacts: BuildArtifacts): ASTStorageCompatibilityReport[] => {
  return newArtifacts.listArtifacts()
  .map((newArtifact) => {
    const oldArtifact = oldArtifacts.getArtifactByName(newArtifact.contractName)
    if (oldArtifact !== undefined) {
      return generateCompatibilityReport(oldArtifact, oldArtifacts, newArtifact, newArtifacts)
    }
    return {
      contract: newArtifact.contractName,
      compatible: true,
      errors: []
    }
  })
}