import { RuleEngine } from './rule-engine';
import {
    RequiredFieldsRule,
    TISSNamespaceRule,
    UTF8EncodingRule,
    XMLDeclarationRule,
    UnknownGuiaTypeRule,
} from './built-in-rules';
import {
    CPFValidationRule,
    CNPJValidationRule,
    CNSValidationRule,
    DateFormatRule,
    DateLogicRule,
    TUSSCodeRule,
    UFCodeRule,
    ConselhoProfissionalRule,
    AuthorizationConsistencyRule,
    BeneficiaryConsistencyRule,
    ValueConsistencyRule,
    RNAtendimentoRule,
    CaraterAtendimentoRule,
    TipoConsultaRule,
    TUSSVersionRule,
    TabelaProcedimentoRule,
    CID10ObrigatorioRule,
    QtdMaxProcedimentosRule,
    QuantidadeSessionRule,
    CoberturiaAcomodacaoRule,
    CNESObrigatorioRule,
    DadosExecutanteCompletoRule,
    DadosSolicitanteCompletoRule,
    IdadeProcedimentoRule,
    CarenciaRule,
    LimiteLoteRule,
    NumeroLoteUnicoRule,
    SenhaAutorizacaoRule,
    DataAutorizacaoVencidaRule,
    AnexoObrigatorioRule,
    AnexoFormatoRule,
} from './business-rules';
import { ValorCalculoRule } from './valor-calculo-rule';
import { AnexoObrigatorioPorProcedimentoRule } from './anexo-obrigatorio-procedimento-rule';
import { CBOSValidationRule } from './table-rules';
import {
    CabecalhoStructureRule,
    SimpleDataTypesRule,
    EnumerationValuesRule,
    CardinalityRule,
    IdentificacaoTransacaoRule,
} from './xsd-structural-rules';
import { SexoProcedimentoRule, DuplicidadeGuiaRule, LateralidadeRule } from './clinical-rules';

/**
 * Instância global do motor de regras
 * Usada por todo o sistema de validação
 */
export const globalRuleEngine = new RuleEngine();

/**
 * Registra todas as regras built-in no motor global
 * Esta função é chamada automaticamente ao importar este módulo
 */
export function registerBuiltInRules(): void {
    // Regras básicas (Task 1)
    globalRuleEngine.register(new XMLDeclarationRule());
    globalRuleEngine.register(new UTF8EncodingRule());
    globalRuleEngine.register(new TISSNamespaceRule());
    globalRuleEngine.register(new UnknownGuiaTypeRule());
    globalRuleEngine.register(new RequiredFieldsRule());

    // Regras estruturais XSD (extraídas dos schemas)
    globalRuleEngine.register(new CabecalhoStructureRule());
    globalRuleEngine.register(new SimpleDataTypesRule());
    globalRuleEngine.register(new EnumerationValuesRule());
    globalRuleEngine.register(new CardinalityRule());
    globalRuleEngine.register(new IdentificacaoTransacaoRule());

    // Regras de validação de documentos (Task 2 - Fase 1)
    globalRuleEngine.register(new CPFValidationRule());
    globalRuleEngine.register(new CNPJValidationRule());
    globalRuleEngine.register(new CNSValidationRule());

    // Regras de validação de datas (Task 2 - Fase 2)
    globalRuleEngine.register(new DateFormatRule());
    globalRuleEngine.register(new DateLogicRule());

    // Regras de valid ação de tabelas (Task 2 - Fase 3)
    globalRuleEngine.register(new TUSSCodeRule());
    globalRuleEngine.register(new UFCodeRule());
    globalRuleEngine.register(new ConselhoProfissionalRule());
    globalRuleEngine.register(new CBOSValidationRule());

    // Regras de relacionamento (Task 2 - Fase 4)
    globalRuleEngine.register(new AuthorizationConsistencyRule());
    globalRuleEngine.register(new BeneficiaryConsistencyRule());
    globalRuleEngine.register(new ValueConsistencyRule());
    globalRuleEngine.register(new ValorCalculoRule()); // Nova regra de cálculo de valores

    // Regras de negócio (Task 2 - Fase 5)
    globalRuleEngine.register(new RNAtendimentoRule());
    globalRuleEngine.register(new CaraterAtendimentoRule());
    globalRuleEngine.register(new TipoConsultaRule());

    // ⭐ REGRAS CRÍTICAS ANTI-GLOSA (9 regras)
    globalRuleEngine.register(new TUSSVersionRule());
    globalRuleEngine.register(new TabelaProcedimentoRule());
    globalRuleEngine.register(new CID10ObrigatorioRule());
    globalRuleEngine.register(new QtdMaxProcedimentosRule());
    globalRuleEngine.register(new QuantidadeSessionRule());
    globalRuleEngine.register(new CoberturiaAcomodacaoRule());
    globalRuleEngine.register(new CNESObrigatorioRule());
    globalRuleEngine.register(new DadosExecutanteCompletoRule());
    globalRuleEngine.register(new DadosSolicitanteCompletoRule());

    // 🔸 REGRAS COMPLEMENTARES ANTI-GLOSA (8 regras)
    globalRuleEngine.register(new IdadeProcedimentoRule());
    globalRuleEngine.register(new CarenciaRule());
    globalRuleEngine.register(new LimiteLoteRule());
    globalRuleEngine.register(new NumeroLoteUnicoRule());
    globalRuleEngine.register(new SenhaAutorizacaoRule());
    globalRuleEngine.register(new DataAutorizacaoVencidaRule());
    globalRuleEngine.register(new AnexoObrigatorioRule());
    globalRuleEngine.register(new AnexoFormatoRule());
    globalRuleEngine.register(new AnexoObrigatorioPorProcedimentoRule()); // Nova regra de anexos por procedimento
    globalRuleEngine.register(new SexoProcedimentoRule());
    globalRuleEngine.register(new DuplicidadeGuiaRule());
    globalRuleEngine.register(new LateralidadeRule());

    const stats = globalRuleEngine.getStats();
    console.log(`✓ ${stats.total} regras registradas (${stats.enabled} habilitadas)`);
}

// Auto-inicialização: registra regras ao importar o módulo
registerBuiltInRules();

/**
 * Re-exporta classes de regras para facilitar extensão
 */
export {
    RequiredFieldsRule,
    TISSNamespaceRule,
    UTF8EncodingRule,
    XMLDeclarationRule,
    UnknownGuiaTypeRule,
} from './built-in-rules';

export {
    CPFValidationRule,
    CNPJValidationRule,
    CNSValidationRule,
    DateFormatRule,
    DateLogicRule,
    TUSSCodeRule,
    UFCodeRule,
    ConselhoProfissionalRule,
    AuthorizationConsistencyRule,
    BeneficiaryConsistencyRule,
    ValueConsistencyRule,
    RNAtendimentoRule,
    CaraterAtendimentoRule,
    TipoConsultaRule,
    TUSSVersionRule,
    TabelaProcedimentoRule,
    CID10ObrigatorioRule,
    QtdMaxProcedimentosRule,
    QuantidadeSessionRule,
    CoberturiaAcomodacaoRule,
    CNESObrigatorioRule,
    DadosExecutanteCompletoRule,
    DadosSolicitanteCompletoRule,
} from './business-rules';

/**
 * Re-exporta tipos principais
 */
export type {
    ValidationRule,
    ValidationContext,
    RuleEngineResult,
    RuleEngineOptions,
} from './rule-types';

export { RuleEngine } from './rule-engine';
