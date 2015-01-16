	var viewWidth = screen.width;
	var viewHeight = screen.height;

	// Create a pixi renderer
	var renderer = PIXI.autoDetectRenderer(viewWidth, viewHeight);
	renderer.view.className = "rendererView";
	
	// add render view to DOM
	document.body.appendChild(renderer.view);

	// create an new instance of a pixi stage
	var stage = new PIXI.Stage(0x11B0011);
	var up_textures = [] ,down_textures = [];
	var hit,hit_count = 0;
	var button_sounds = [];
	var buttons = [];
	
	var assetsToLoad = [];
	for(var id = 0 ; id < 4 ;id++)
		{
			assetsToLoad.push("img/"+id+"u.png");
			assetsToLoad.push("img/"+id+"d.png");
			button_sounds.push(new Audio('sounds/'+id+'n.wav'));
		}
		loader = new PIXI.AssetLoader(assetsToLoad);
		loader.onComplete = loaded();
		loader.load();
	
		function loaded()
		{
			for(var id = 0 ; id < 4 ;id++)
			{
				up_textures.push(PIXI.Texture.fromImage("img/"+id+"u.png"));
				down_textures.push(PIXI.Texture.fromImage("img/"+id+"d.png"));
				console.log(up_textures[id]);
			}
			console.log("finished loading");
		}
	
	
	for(var id = 0 ; id < 4 ;id++)
	{
		//console.log(String.fromCharCode(ch));		
		var temp_button;	
			
		//console.log(up_textures[id]);
		
		temp_button = new PIXI.Sprite(up_textures[id]);
		temp_button.secret = id;
		temp_button.buttonMode = true;
		temp_button.interactive = true;		
		
		temp_button.anchor.x = temp_button.anchor.y = 0.5;
		
		buttons.push(temp_button);	
	   // console.log(temp_button);
		
		buttons[id].mousedown = function(data)
		{
			 //console.log(this);
			 button_sounds[this.secret].play();
			 this.setTexture(down_textures[this.secret]);	
			 hit = this.secret;
			 hit_count ++;
		};
		
		buttons[id].mouseup = function(data)
		{
			 //console.log(this.secret);
			 this.setTexture(up_textures[this.secret]);		
			 hit = -1;
		};	
		
	}	
	var dist_scale = 500,score = 0;
	
	var score_disp = new PIXI.Text(score,{ font: "italic 60px Arvo", fill: "#3e1707", align: "center", stroke: "#a4410e", strokeThickness: 2 });
	
	
	function button_positions_animation(dist_scale)
	{
		buttons[0].position.x = viewWidth/2-dist_scale;
		buttons[0].position.y = viewHeight/2-dist_scale;	
	
		buttons[1].position.x = viewWidth/2+dist_scale;
		buttons[1].position.y = viewHeight/2-dist_scale;	
	
		buttons[2].position.x = viewWidth/2-dist_scale;
		buttons[2].position.y = viewHeight/2+dist_scale;	
		
		buttons[3].position.x = viewWidth/2+dist_scale;
		buttons[3].position.y = viewHeight/2+dist_scale;
		score_disp.position.x = viewWidth/2+dist_scale + 300;
		score_disp.position.y = viewHeight/2-dist_scale;		
	}
	button_positions_animation(dist_scale);
	
	for(var i = 0 ; i<=3 ;i++)
	{
		stage.addChild(buttons[i]);	
	}
	//generating a random sequence of length n
	function gen_seq(n)
	{
		var result = [];
		for(var i=0 ; i < n ; i++)
		{
			result.push((Math.floor(Math.random()*50))%4);
			//console.log(result[i]);
		}
		return result;
	}
	var game_state = "game_init",index = 0;
	
	
	
	var start , wait = 25 , tick=0 , user_index,textset=false , gap , current_seq_size = 1;
	var question =[];
	
	/*document.onmousedown = function(){		
		if(game_state=="user's_turn")
		{
			current_seq_size++;
			index = 0;	
			console.log("SIMON IS PLAYING");
			game_state = "simon_playing";
			gap = tick+20;
			requestAnimationFrame(animate);
		}
	};*/
	
	var prev_hitcount = 0;
	
	
	var gameover = new PIXI.Text("GAME OVER!!", { font: "bold 60px Arial", fill: "#cc00ff", align: "center", stroke: "#FFFFFF", strokeThickness: 10 });
	gameover.visible = false;
	
	
	var anim_complete = false;
	stage.addChild(score_disp);
	stage.addChild(gameover);
	
	gameover.visible = false;
	requestAnimationFrame(animate);
	//console.log(buttons[0].up.width);
	function animate()
	{
		tick++;
		renderer.render(stage);
		if(game_state == "game_init")
		{
			score_disp.setText(''+0);	
			if(dist_scale > 115)
			{
				dist_scale -= 2;
				button_positions_animation(dist_scale);
			}
			else
			{
				dist_scale=115;
				gameover.position.x = viewWidth/2-dist_scale-100;
				gameover.position.y = viewHeight/2+dist_scale + 300;			
				tick = 0;	
				game_state="simon_init";
				console.log("simon init");
			}
		}
		
		if(game_state=="simon_init")
		{
			question = gen_seq(20);
			game_state="simon_playing";			
			console.log(question);
			textset = false;
			current_seq_size = 1;
			prev_hitcount = 0;
			hit_count = 0;	
			index = 0;
			score = 0;
			gap = tick+50;
		}
		
		if(game_state == "simon_playing")
		{
			
			//play the sequence			
			if(tick-gap > wait)
			{
				if(index == current_seq_size)
				{	hit_count = 0;
					user_index = 0;
					game_state = "user's_turn";									
				}
				else{
					if(!textset)
					{						
						button_sounds[question[index]].play();
						buttons[question[index]].setTexture(down_textures[question[index]]);	
						start = tick;
						textset = true;
					}
					else
					{
						if(tick-start > wait)
						{
							buttons[question[index]].setTexture(up_textures[question[index]]);;
							textset = false;
							gap = tick;
							index++;
						}
					}
				}
			}			
		}
		
		if(game_state == "user's_turn")
		{
			//console.log("Waiting for user's turn to complete.",user_index);			
			var hits_to_record = current_seq_size;
			//console.log(hit_count,prev_hitcount);
			if(user_index < current_seq_size)
			{
				if(hit_count != prev_hitcount && hit>=0)
				{
					console.log(hit_count,prev_hitcount,user_index);
					if(hit != question[user_index])
					{
						console.log("FAILED ",hit,hit_count,user_index);
						game_state = "user_lost";
					}
					else
					{
						console.log("CORRECT!");
						user_index++;
						prev_hitcount = hit_count;
					}
				}
			}
			else
			{
				console.log("USER'S TURN IS COMPLETE");
				score++;
				score_disp.setText(''+score);				
				//console.log("score");
				current_seq_size++;
				prev_hitcount = -1;
				user_index = 0;
				index = 0;	
				console.log("SIMON IS PLAYING");
				game_state = "simon_playing";
				gap = tick+20;				
			}
			
		}		
		//if(game_state != "user's_turn")
			if(game_state =="user_lost")
			{
				if(!anim_complete)
				{
					gameover.visible = true;
					if(gameover.position.y > 0)
					{
						gameover.position.y-=1.5;						
					}
					else
					{
						anim_complete = true;
					}
				}
				else
				{
					//retry button -> takes to menu
					dist_scale = 500;
					game_state = "game_init";
					anim_complete = false;
				}
			}
		requestAnimationFrame(animate);
		
	}