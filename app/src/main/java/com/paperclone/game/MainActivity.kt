package com.paperclone.game

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.viewModels
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Surface
import androidx.compose.ui.Modifier
import androidx.navigation.compose.rememberNavController
import com.paperclone.game.core.audio.SoundManager
import com.paperclone.game.ui.navigation.PaperCloneNavGraph
import com.paperclone.game.ui.theme.CandyPalette
import com.paperclone.game.ui.theme.PaperCloneTheme
import com.paperclone.game.ui.viewmodel.GameViewModel

class MainActivity : ComponentActivity() {

    private val viewModel: GameViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            PaperCloneTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = CandyPalette.BackgroundMint
                ) {
                    val navController = rememberNavController()
                    PaperCloneNavGraph(
                        navController = navController,
                        viewModel = viewModel
                    )
                }
            }
        }
    }

    override fun onResume() {
        super.onResume()
        SoundManager.getInstance(this).resumeBgm()
    }

    override fun onPause() {
        super.onPause()
        SoundManager.getInstance(this).pauseBgm()
    }

    override fun onDestroy() {
        super.onDestroy()
        SoundManager.getInstance(this).release()
    }
}
