export type Lang = "en" | "es";

export const ui = {
  en: {
    // Global
    appTitle: "ForkliftIA",
    language: "Language",
    es: "Spanish",
    en: "English",
    notLoggedIn: "Not logged in",
    loginRequired: "Login required to continue.",
    loginWithGoogle: "Login with Google",
    signingIn: "Signing in...",

    // Landing
    landingTitle: "ForkliftIA",
    landingSubtitle:
      "AI-assisted diagnostics built for real forklift technicians.",
    cardDiagnosisTitle: "AI Troubleshooting",
    cardDiagnosisDesc:
      "Create a diagnostic case and get structured guidance based on manuals and real cases.",
    cardForumTitle: "Technical Forum",
    cardForumDesc:
      "Browse open cases and resolved fixes. Read-only for now.",
    openDiagnosis: "Open diagnosis",
    openForum: "Open forum",
    soon: "Soon",

    // Diagnosis form
    diagnosis: "Get diagnosis",
    generating: "Generating...",
    loadCases: "Load cases",
    loading: "Loading...",
    savedCases: "Saved cases",
    caseId: "Case ID",
    source: "Source",
    sourceAi: "AI",
    sourceCases: "Case base",

    brand: "Brand",
    model: "Model",
    seriesOptional: "Series (optional)",
    errorCodeOptional: "Error code (optional)",
    symptom: "Symptom",
    checksDone: "Checks done",

    symptomPlaceholder: "Does not lift load, cuts out, etc.",
    checksPlaceholder: "Battery OK, fuses OK, cables checked...",
    brandPlaceholder: "linde, bt, jungheinrich...",
    modelPlaceholder: "e20, ose250...",
    seriesPlaceholder: "335...",
    errorCodePlaceholder: "e225...",

    // Case actions
    open: "Open",
    resolved: "Resolved",
    closeCase: "Close case",
    closing: "Closing...",
    resolution: "Resolution",
    resolutionPlaceholder:
      "Final fix applied (e.g. replace solenoid connector, adjust lift sensor)",
    resolutionMissing:
      "Write the final fix applied (at least one line).",
    resolvedLabel: "Resolved",

    // Forum
    forum: "Technical Forum",
    forumReadOnly: "Read-only mode. Comments come later.",
    openCases: "Open cases",
    resolvedCases: "Resolved cases",
    refresh: "Refresh",
    refreshing: "Refreshing...",
    caseDetail: "Case detail",
    selectCase: "Select a case to view details.",
    noCases: "No cases found.",
    status: "Status",
    code: "Code",
    editCase: "Edit",
    cancelEdit: "Cancel",
    saveChanges: "Save changes",
    saving: "Saving...",
    comments: "Comments",
    comment: "Comment",
    posting: "Posting...",
    commentPlaceholder: "Share more details or ask a follow-up question",
    noComments: "No comments yet.",
    commentPosted: "Comment added",
    loginToComment: "Please sign in to comment.",
    validationError: "Validation error.",
  },

  es: {
    // Global
    appTitle: "ForkliftIA",
    language: "Idioma",
    es: "Español",
    en: "Inglés",
    notLoggedIn: "No estás logueado",
    loginRequired: "Tenés que iniciar sesión para continuar.",
    loginWithGoogle: "Ingresar con Google",
    signingIn: "Ingresando...",

    // Landing
    landingTitle: "ForkliftIA",
    landingSubtitle:
      "Diagnóstico asistido por IA pensado para técnicos de autoelevadores.",
    cardDiagnosisTitle: "Diagnóstico con IA",
    cardDiagnosisDesc:
      "Creá un caso y recibí una guía estructurada basada en manuales y casos reales.",
    cardForumTitle: "Foro técnico",
    cardForumDesc:
      "Ver casos abiertos y soluciones resueltas. Por ahora, solo lectura.",
    openDiagnosis: "Abrir diagnóstico",
    openForum: "Abrir foro",
    soon: "Próximamente",

    // Diagnosis form
    diagnosis: "Obtener diagnóstico",
    generating: "Generando...",
    loadCases: "Cargar casos",
    loading: "Cargando...",
    savedCases: "Casos guardados",
    caseId: "ID de caso",
    source: "Origen",
    sourceAi: "IA",
    sourceCases: "Base de casos",

    brand: "Marca",
    model: "Modelo",
    seriesOptional: "Serie (opcional)",
    errorCodeOptional: "Código de error (opcional)",
    symptom: "Síntoma",
    checksDone: "Chequeos realizados",

    symptomPlaceholder: "No levanta carga, se corta, etc.",
    checksPlaceholder: "Batería OK, fusibles OK, cables revisados...",
    brandPlaceholder: "linde, bt, jungheinrich...",
    modelPlaceholder: "e20, ose250...",
    seriesPlaceholder: "335...",
    errorCodePlaceholder: "e225...",

    // Case actions
    open: "Abiertos",
    resolved: "Resueltos",
    closeCase: "Cerrar caso",
    closing: "Cerrando...",
    resolution: "Solución",
    resolutionPlaceholder:
      "Solución aplicada (ej: cambio ficha solenoide, ajuste sensor elevación)",
    resolutionMissing:
      "Escribí la solución aplicada (aunque sea una línea).",
    resolvedLabel: "Resuelto",

    // Forum
    forum: "Foro técnico",
    forumReadOnly: "Modo solo lectura. Comentarios más adelante.",
    openCases: "Casos abiertos",
    resolvedCases: "Casos resueltos",
    refresh: "Actualizar",
    refreshing: "Actualizando...",
    caseDetail: "Detalle del caso",
    selectCase: "Seleccioná un caso para ver el detalle.",
    noCases: "No hay casos para mostrar.",
    status: "Estado",
    code: "Código",
    editCase: "Editar",
    cancelEdit: "Cancelar",
    saveChanges: "Guardar cambios",
    saving: "Guardando...",
    comments: "Comentarios",
    comment: "Comentar",
    posting: "Publicando...",
    commentPlaceholder: "Compartí más detalles o preguntá algo puntual",
    noComments: "Aún no hay comentarios.",
    commentPosted: "Comentario publicado",
    loginToComment: "Iniciá sesión para comentar.",
    validationError: "Error de validación.",
  },
} as const;
