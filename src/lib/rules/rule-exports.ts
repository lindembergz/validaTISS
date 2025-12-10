// Re-export table rules (Fase 3)
export { TUSSCodeRule, UFCodeRule, ConselhoProfissionalRule, CBOSValidationRule } from './table-rules';

// Re-export XSD structural rules
export { CabecalhoStructureRule, SimpleDataTypesRule, EnumerationValuesRule, CardinalityRule, IdentificacaoTransacaoRule } from './xsd-structural-rules';

// Re-export relationship rules (Fase 4)
export { AuthorizationConsistencyRule, BeneficiaryConsistencyRule, ValueConsistencyRule } from './relationship-rules';

// Re-export business logic rules (Fase 5)
export { RNAtendimentoRule, CaraterAtendimentoRule, TipoConsultaRule } from './business-logic-rules';

// Re-export critical anti-glosa rules (MVP - 9 regras)
export {
    TUSSVersionRule,
    TabelaProcedimentoRule,
    CID10ObrigatorioRule,
    QtdMaxProcedimentosRule,
    QuantidadeSessionRule,
    CoberturiaAcomodacaoRule,
    CNESObrigatorioRule,
    DadosExecutanteCompletoRule,
    DadosSolicitanteCompletoRule,
} from './critical-rules';

// Re-export complementary anti-glosa rules (8 regras)
export {
    IdadeProcedimentoRule,
    CarenciaRule,
    LimiteLoteRule,
    NumeroLoteUnicoRule,
    SenhaAutorizacaoRule,
    DataAutorizacaoVencidaRule,
    AnexoObrigatorioRule,
    AnexoFormatoRule,
} from './complementary-rules';