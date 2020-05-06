<template>
    <div class="resolution-overlay-container" style="display: block;">
        <div>
        Erreur - Page introuvable<br>
        <router-link to="/" class="btn btn-primary">Revenir à l'accueil</router-link>
        </div>
    </div>
</template>

<script>
/**
 * @vuese
 * @group Views
 * Page d'erreur 404 (page introuvable)
 */
export default {
    name: 'NotFound'
}
</script>