module.exports = [
    {
        title: 'RPG System - Main',
        placeholder: 'Selecione a opção',
        customId: 'rpgMainRow',
        minValues: 1,
        maxValues: 1,
        options: [
            {
                label: 'Gerenciamento de Personagens',
                value: 'charManager',
                description: 'Melhore seus personagens, visualize skills e modifique habilidades',
                emoji: '⚙️'
            },
            {
                label: 'Iniciar Missão',
                value: 'startMission',
                description: 'Iniciar uma missão com seu personagem ativo',
                emoji: '🌲'
            },
            {
                label: 'Finalizar Missão',
                value: 'missionResult',
                description: 'Cheque o resultado da sua missão',
                emoji: '💮'
            }
        ]
    },
    {
        title: `RPG System - Manage Menu`,
        placeholder: 'Selecione a opção',
        customId: 'rpgManageCharRow',
        minValues: 1,
        maxValues: 1,
        options: [
            {
                label: 'Voltar',
                value: 'returnRow',
                description: 'Voltar para o menu anterior',
                emoji: '👈'
            },
            {
                label: 'Visualizar Skills',
                value: 'charSkills',
                description: 'Visualize as Skills do Personagem',
                emoji: '🔥'
            },
            {
                label: 'Ativar Personagem',
                value: 'newRpgChar',
                description: 'Ative um personagem no sistema de RPG',
                emoji: '🧩'
            },
        ]
    },
    {
        title: `RPG System - Select Mission`,
        placeholder: 'Selecione a opção',
        customId: 'rpgMissionSelect',
        minValues: 1,
        maxValues: 1,
        options: [
            {
                label: 'Voltar',
                value: 'returnRow',
                description: 'Voltar para o menu anterior',
                emoji: '👈'
            },
            {
                label: 'Hunt',
                value: 'missionHunt',
                description: 'Faça uma hunt com seu personagem',
                emoji: '🏹'
            },
            {
                label: 'Dungeon',
                value: 'missionDungeon',
                description: 'Faça uma dungeon com seu personagem',
                emoji: '🌐'
            },
        ]
    },
    {
        title: `RPG System - Select Hunt`,
        placeholder: 'Selecione a opção',
        customId: 'rpgHuntSelect',
        minValues: 1,
        maxValues: 1,
        options: [
            {
                label: 'Voltar',
                value: 'returnRowMissions',
                description: 'Voltar para o menu anterior',
                emoji: '👈'
            },
            {
                label: 'Floresta - Início',
                value: 'huntForest-begin',
                description: 'Nível recomendado: 1 a 5',
                emoji: '🌲'
            },
            {
                label: 'Floresta - Intermediário',
                value: 'huntFortest-intermediary',
                description: 'Nível recomendado: 3 a 8',
                emoji: '🌲'
            },
        ]
    }
]