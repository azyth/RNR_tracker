class RaceEventsController < ApplicationController
  before_action :set_race_event, only: [:show, :edit, :update, :destroy]

  # GET /race_events
  # GET /race_events.json
  def index
    @race_events = RaceEvent.all
  end

  # GET /race_events/1
  # GET /race_events/1.json
  def show
  end

  # GET /race_events/new
  def new
    @race_event = RaceEvent.new
  end

  # GET /race_events/1/edit
  def edit
  end

  # POST /race_events
  # POST /race_events.json
  def create
    @race_event = RaceEvent.new(race_event_params)

    respond_to do |format|
      if @race_event.save
        format.html { redirect_to @race_event, notice: 'Race event was successfully created.' }
        format.json { render :show, status: :created, location: @race_event }
      else
        format.html { render :new }
        format.json { render json: @race_event.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /race_events/1
  # PATCH/PUT /race_events/1.json
  def update
    respond_to do |format|
      if @race_event.update(race_event_params)
        format.html { redirect_to @race_event, notice: 'Race event was successfully updated.' }
        format.json { render :show, status: :ok, location: @race_event }
      else
        format.html { render :edit }
        format.json { render json: @race_event.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /race_events/1
  # DELETE /race_events/1.json
  def destroy
    @race_event.destroy
    respond_to do |format|
      format.html { redirect_to race_events_url, notice: 'Race event was successfully destroyed.' }
      format.json { head :no_content }
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_race_event
      @race_event = RaceEvent.find(params[:id])
    end

    # Never trust parameters from the scary internet, only allow the white list through.
    def race_event_params
      params.require(:race_event).permit(:raceid, :bib, :time, :latitude, :longitude)
    end
end
