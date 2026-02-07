export const messages = {
  auth: {
    loginSuccess: "Connexion réussie",
    loginError: "Erreur de connexion",
    logoutSuccess: "Déconnexion réussie",
    unauthorized: "Accès non autorisé",
    sessionExpired: "Session expirée",
  },
  admin: {
    userApproved: "Utilisateur approuvé avec succès",
    userRejected: "Utilisateur rejeté",
    userDeleted: "Utilisateur supprimé",
    memberAdded: "Membre ajouté avec succès",
    memberRemoved: "Membre supprimé",
  },
  errors: {
    generic: "Une erreur est survenue",
    network: "Erreur de réseau",
    validation: "Données invalides",
  },
}

export type MessageKey = keyof typeof messages
export async function getUnreadMessagesCount(): Promise<number> {
    try {
        // Remplacez cette URL par le point de terminaison de votre API PHP si vous en avez un.
        const response = await fetch('/api/messages/unread-count');
        
        // Si la réponse n'est pas OK, lance une erreur
        if (!response.ok) {
            throw new Error('La requête API a échoué.');
        }

        const data = await response.json();
        return data.count; 
    } catch (error) {
        console.error("Erreur lors de la récupération du nombre de messages non lus :", error);
        return 0; // Retourne 0 en cas d'erreur
    }
}